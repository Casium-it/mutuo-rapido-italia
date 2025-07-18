import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Progress } from "@/components/ui/progress";
import { FormResponse } from "@/types/form";
import { submitFormToSupabase } from "@/services/formSubmissionService";
import { formBehaviorService } from "@/services/formBehaviorService";
import { toast } from "sonner";
import { useSimulationTimer } from "@/hooks/useSimulationTimer";
import { trackSimulationCompleted } from "@/utils/analytics";

export default function FormLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const [actualSubmissionId, setActualSubmissionId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [completionRoute, setCompletionRoute] = useState<string>('/form-completed');
  
  const submissionStartedRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get global simulation timer for completion event
  const { getTotalTimeSpent } = useSimulationTimer();
  
  // Get form data from location state
  const formData = location.state?.formData as {
    responses: FormResponse;
    activeBlocks: string[];
    completedBlocks: string[];
    dynamicBlocks: any[];
    submissionId?: string;
    formSlug?: string;
    simulationId?: string;
    sessionType?: string;
  };
  
  useEffect(() => {
    console.log("FormLoading: Component mounted, starting initialization");
    console.log("FormLoading: Location state:", location.state);
    console.log("FormLoading: FormData received:", formData);
    console.log("FormLoading: FormSlug in data:", formData?.formSlug);
    
    // Enhanced validation - if no form data, redirect to home
    if (!formData || !formData.responses || !formData.activeBlocks) {
      console.error("FormLoading: No valid form data found, redirecting to home");
      navigate("/");
      return;
    }
    
    console.log("FormLoading: Valid form data found, starting progress and submission");
    
    // Always start progress animation immediately for good UX
    startProgressAnimation();
    
    // Start form submission and get completion behavior
    handleFormSubmission();
    
    // Determine completion route based on form behavior
    determineCompletionRoute();
    
    // Cleanup function
    return () => {
      console.log("FormLoading: Component unmounting, cleaning up");
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [formData, navigate]);

  // Handle navigation when both progress and submission are complete
  useEffect(() => {
    console.log("FormLoading: Checking navigation conditions - Progress:", loadingProgress, "Submission completed:", submissionCompleted, "Submission ID:", actualSubmissionId, "Error:", submissionError);
    
    if (loadingProgress >= 100 && submissionCompleted && actualSubmissionId) {
      console.log("FormLoading: All conditions met, navigating to completion page");
      setTimeout(() => {
        navigate(completionRoute, { 
          state: { 
            submissionData: {
              id: actualSubmissionId,
              submissionId: actualSubmissionId,
              ...formData,
              submissionTime: new Date().toISOString()
            }
          }
        });
      }, 500); // Small delay for smooth UX
    } else if (loadingProgress >= 100 && submissionError) {
      console.error("FormLoading: Submission failed, showing error and going back");
      toast.error("Errore durante l'invio", {
        description: submissionError
      });
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  }, [loadingProgress, submissionCompleted, actualSubmissionId, submissionError, navigate, formData, completionRoute]);

  const handleFormSubmission = async () => {
    // Prevent duplicate submissions
    if (submissionStartedRef.current) {
      console.log("FormLoading: Submission already in progress, skipping");
      return;
    }
    
    console.log("FormLoading: Starting form submission process");
    submissionStartedRef.current = true;
    setIsSubmitting(true);
    
    try {
      console.log("FormLoading: Beginning form submission to Supabase");
      console.log("FormLoading: Form responses:", Object.keys(formData.responses).length);
      console.log("FormLoading: Active blocks:", formData.activeBlocks.length);
      console.log("FormLoading: Dynamic blocks:", formData.dynamicBlocks?.length || 0);
      
      // Create form state for submission service with proper types
      const formStateForSubmission = {
        simulationId: formData.simulationId || 'LEGACY-SUBMISSION',
        sessionType: (formData.sessionType || 'new') as any,
        formSlug: formData.formSlug, // Include formSlug in submission
        activeBlocks: formData.activeBlocks,
        responses: formData.responses,
        completedBlocks: formData.completedBlocks,
        dynamicBlocks: formData.dynamicBlocks || [],
        activeQuestion: { block_id: '', question_id: '' },
        answeredQuestions: new Set<string>(),
        navigationHistory: [],
        blockActivations: {},
        pendingRemovals: []
      };
      
      // Try to get formSlug from multiple sources with better fallback
      let formSlug = formData.formSlug;
      if (!formSlug) {
        const pathParts = window.location.pathname.split('/');
        const simulazioneIndex = pathParts.indexOf('simulazione');
        if (simulazioneIndex !== -1 && pathParts[simulazioneIndex + 1]) {
          formSlug = pathParts[simulazioneIndex + 1];
        }
      }
      if (!formSlug) {
        formSlug = 'simulazione-mutuo'; // Default to main form instead of 'unknown'
      }
      
      console.log("FormLoading: Using formSlug for submission:", formSlug);
      
      // Updated call with only 2 arguments - removed allAvailableBlocks parameter
      const result = await submitFormToSupabase(formStateForSubmission, formSlug);
      
      if (result.success && result.submissionId) {
        console.log("FormLoading: Form submitted successfully, ID:", result.submissionId);
        
        // Track successful completion with total time spent from simulation start
        const totalTimeSpent = getTotalTimeSpent();
        trackSimulationCompleted(totalTimeSpent);
        
        setActualSubmissionId(result.submissionId);
        setSubmissionCompleted(true);
      } else {
        console.error("FormLoading: Submission failed:", result.error);
        setSubmissionError(result.error || "Si è verificato un errore durante l'invio del modulo.");
      }
      
    } catch (error) {
      console.error('FormLoading: Unexpected error during submission:', error);
      setSubmissionError("Si è verificato un errore imprevisto. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const determineCompletionRoute = async () => {
    try {
      // Try to get formSlug from multiple sources
      let formSlug = formData?.formSlug;
      
      // If formSlug is not in formData, try to extract from URL
      if (!formSlug) {
        const pathParts = window.location.pathname.split('/');
        const simulazioneIndex = pathParts.indexOf('simulazione');
        if (simulazioneIndex !== -1 && pathParts[simulazioneIndex + 1]) {
          formSlug = pathParts[simulazioneIndex + 1];
          console.log('FormLoading: Extracted formSlug from URL:', formSlug);
        }
      }
      
      // Final fallback
      if (!formSlug) {
        formSlug = 'simulazione-mutuo'; // Default to main form
        console.warn('FormLoading: Using default formSlug fallback:', formSlug);
      }
      
      console.log('FormLoading: Determining completion route for form:', formSlug);
      
      const behavior = await formBehaviorService.getFormBehavior(formSlug);
      if (behavior?.completion_behavior) {
        const route = formBehaviorService.getCompletionRoute(behavior.completion_behavior);
        console.log('FormLoading: Setting completion route to:', route);
        setCompletionRoute(route);
      } else {
        console.log('FormLoading: Using default completion route');
        setCompletionRoute('/form-completed');
      }
    } catch (error) {
      console.error('FormLoading: Error determining completion route:', error);
      setCompletionRoute('/form-completed'); // fallback
    }
  };

  const startProgressAnimation = () => {
    console.log("FormLoading: Starting progress animation");
    const totalDuration = 5000; // 5 seconds
    const intervalTime = 50; // Update every 50ms
    const totalSteps = totalDuration / intervalTime;
    const progressPerStep = 100 / totalSteps;
    
    let currentStep = 0;
    
    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(currentStep * progressPerStep, 100);
      
      setLoadingProgress(newProgress);
      
      if (newProgress >= 100) {
        console.log("FormLoading: Progress animation completed");
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, intervalTime);
  };

  // Determine display messages based on current state
  const getDisplayMessage = () => {
    if (submissionError) {
      return "Errore durante l'invio";
    }
    if (loadingProgress >= 100 && !submissionCompleted) {
      return "Quasi finito... attendi";
    }
    if (loadingProgress >= 100 && submissionCompleted) {
      return "Completato!";
    }
    return "Stiamo elaborando la tua richiesta";
  };

  const getDisplayDescription = () => {
    if (submissionError) {
      return "Si è verificato un errore. Verrai reindirizzato.";
    }
    if (loadingProgress >= 100 && !submissionCompleted) {
      return "Finalizzazione in corso...";
    }
    if (loadingProgress >= 100 && submissionCompleted) {
      return "Reindirizzamento alla pagina dei risultati...";
    }
    return "I tuoi dati vengono salvati in modo sicuro. Tra un momento verrai reindirizzato.";
  };

  const getProgressSubtext = () => {
    if (submissionError) {
      return "Errore";
    }
    if (loadingProgress >= 100 && !submissionCompleted) {
      return "Finalizzazione...";
    }
    if (loadingProgress >= 100 && submissionCompleted) {
      return "Reindirizzamento...";
    }
    return "Salvataggio dati...";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="py-3 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-200">
        <Logo />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center space-y-8 max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="dots-loader mb-8"></div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {getDisplayMessage()}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              {getDisplayDescription()}
            </p>
            
            <div className="w-full space-y-3">
              <Progress 
                value={loadingProgress} 
                className="h-3 bg-gray-200"
                indicatorClassName={`transition-all duration-75 ease-linear ${submissionError ? 'bg-red-500' : 'bg-[#245C4F]'}`}
              />
              <p className="text-sm text-gray-600 font-medium">
                {Math.round(loadingProgress)}% completato
              </p>
              
              <p className="text-xs text-gray-500">
                {getProgressSubtext()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for loader animation */}
      <style>
        {`
        .dots-loader {
          width: 65px;
          aspect-ratio: 1;
          --g: radial-gradient(farthest-side, #0000 calc(95% - 3px), #245C4F calc(100% - 3px) 98%, #0000 101%) no-repeat;
          background: var(--g), var(--g), var(--g);
          background-size: 30px 30px;
          animation: dotsAnim 1.5s infinite;
        }
        @keyframes dotsAnim {
          0% {
            background-position: 0 0, 0 100%, 100% 100%;
          }
          25% {
            background-position: 100% 0, 0 100%, 100% 100%;
          }
          50% {
            background-position: 100% 0, 0 0, 100% 100%;
          }
          75% {
            background-position: 100% 0, 0 0, 0 100%;
          }
          100% {
            background-position: 100% 100%, 0 0, 0 100%;
          }
        }
        `}
      </style>
      
      {/* Footer */}
      <footer className="py-6 px-4 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GoMutuo. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
