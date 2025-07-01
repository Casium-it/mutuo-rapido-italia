import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Progress } from "@/components/ui/progress";
import { FormResponse } from "@/types/form";
import { submitFormToSupabase } from "@/services/formSubmissionService";
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
  
  const submissionStartedRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get global simulation timer for completion event
  const { getTotalTimeSpent } = useSimulationTimer();
  
  // Get form data from location state with enhanced debugging
  const formData = location.state?.formData as {
    responses: FormResponse;
    activeBlocks: string[];
    completedBlocks: string[];
    dynamicBlocks: any[];
    submissionId?: string;
    blocks?: any[]; // Add blocks from FormContext
    formSource?: 'database' | 'static'; // Add form source info
    formSlug?: string; // Add form slug
  };
  
  useEffect(() => {
    console.log("🔍 FormLoading: Component mounted, starting debug analysis");
    console.log("📊 FormLoading: Form data received:", {
      hasFormData: !!formData,
      responsesCount: formData?.responses ? Object.keys(formData.responses).length : 0,
      activeBlocksCount: formData?.activeBlocks?.length || 0,
      completedBlocksCount: formData?.completedBlocks?.length || 0,
      dynamicBlocksCount: formData?.dynamicBlocks?.length || 0,
      hasBlocks: !!formData?.blocks,
      blocksCount: formData?.blocks?.length || 0,
      formSource: formData?.formSource || 'unknown',
      formSlug: formData?.formSlug || 'unknown'
    });
    
    // Debug responses structure
    if (formData?.responses) {
      console.log("📝 FormLoading: Form responses detail:");
      Object.entries(formData.responses).forEach(([questionId, response]) => {
        console.log(`   Question ${questionId}:`, response);
      });
    }
    
    // Enhanced validation - if no form data, redirect to home
    if (!formData || !formData.responses || !formData.activeBlocks) {
      console.error("❌ FormLoading: No valid form data found, redirecting to home");
      navigate("/");
      return;
    }
    
    console.log("✅ FormLoading: Valid form data found, starting progress and submission");
    
    // Always start progress animation immediately for good UX
    startProgressAnimation();
    
    // Start form submission (with duplicate prevention)
    handleFormSubmission();
    
    // Cleanup function
    return () => {
      console.log("🧹 FormLoading: Component unmounting, cleaning up");
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [formData, navigate]);

  // Handle navigation when both progress and submission are complete
  useEffect(() => {
    console.log("🚦 FormLoading: Checking navigation conditions", {
      progress: loadingProgress, 
      submissionCompleted, 
      submissionId: actualSubmissionId, 
      error: submissionError
    });
    
    if (loadingProgress >= 100 && submissionCompleted && actualSubmissionId) {
      console.log("✅ FormLoading: All conditions met, navigating to completion page");
      setTimeout(() => {
        navigate("/form-completed", { 
          state: { 
            submissionData: {
              id: actualSubmissionId,
              submissionId: actualSubmissionId,
              ...formData,
              submissionTime: new Date().toISOString()
            }
          }
        });
      }, 500);
    } else if (loadingProgress >= 100 && submissionError) {
      console.error("❌ FormLoading: Submission failed, showing error and going back");
      toast.error("Errore durante l'invio", {
        description: submissionError
      });
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  }, [loadingProgress, submissionCompleted, actualSubmissionId, submissionError, navigate, formData]);

  const handleFormSubmission = async () => {
    // Prevent duplicate submissions
    if (submissionStartedRef.current) {
      console.log("⚠️ FormLoading: Submission already in progress, skipping");
      return;
    }
    
    console.log("🚀 FormLoading: Starting form submission process");
    submissionStartedRef.current = true;
    setIsSubmitting(true);
    
    try {
      console.log("📡 FormLoading: Beginning enhanced form submission to Supabase");
      console.log("📊 FormLoading: Enhanced submission data:", {
        responsesCount: Object.keys(formData.responses).length,
        activeBlocksCount: formData.activeBlocks.length,
        dynamicBlocksCount: formData.dynamicBlocks?.length || 0,
        providedBlocksCount: formData.blocks?.length || 0,
        formSource: formData.formSource,
        formSlug: formData.formSlug
      });
      
      // Create enhanced form state for submission service
      const enhancedFormState = {
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
      
      console.log("📋 FormLoading: Enhanced form state created:", {
        responsesKeys: Object.keys(enhancedFormState.responses),
        activeBlocks: enhancedFormState.activeBlocks,
        dynamicBlocksCount: enhancedFormState.dynamicBlocks.length
      });
      
      // Use provided blocks or fallback to import
      let blocksForSubmission = formData.blocks;
      if (!blocksForSubmission) {
        console.log("📦 FormLoading: No blocks provided, importing static blocks");
        const { allBlocks } = await import('@/data/formBlocks');
        blocksForSubmission = allBlocks;
      }
      
      // Combine all blocks for submission service
      const allAvailableBlocks = [...blocksForSubmission, ...(formData.dynamicBlocks || [])];
      console.log("🔧 FormLoading: Total blocks for submission:", {
        staticBlocks: blocksForSubmission.length,
        dynamicBlocks: formData.dynamicBlocks?.length || 0,
        totalBlocks: allAvailableBlocks.length
      });
      
      const result = await submitFormToSupabase(
        enhancedFormState, 
        allAvailableBlocks,
        {
          formSource: formData.formSource || 'static',
          formSlug: formData.formSlug
        }
      );
      
      if (result.success && result.submissionId) {
        console.log("✅ FormLoading: Form submitted successfully, ID:", result.submissionId);
        
        // Track successful completion with total time spent from simulation start
        const totalTimeSpent = getTotalTimeSpent();
        trackSimulationCompleted(totalTimeSpent);
        
        setActualSubmissionId(result.submissionId);
        setSubmissionCompleted(true);
      } else {
        console.error("❌ FormLoading: Submission failed:", result.error);
        setSubmissionError(result.error || "Si è verificato un errore durante l'invio del modulo.");
      }
      
    } catch (error) {
      console.error('💥 FormLoading: Unexpected error during submission:', error);
      setSubmissionError("Si è verificato un errore imprevisto. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startProgressAnimation = () => {
    console.log("⏳ FormLoading: Starting progress animation");
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
        console.log("✅ FormLoading: Progress animation completed");
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

  // Helper functions
  function getDisplayMessage() {
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
  }

  function getDisplayDescription() {
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
  }

  function getProgressSubtext() {
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
  }
}
