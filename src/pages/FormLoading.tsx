
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Progress } from "@/components/ui/progress";
import { FormResponse } from "@/types/form";
import { submitFormToSupabase } from "@/services/formSubmissionService";
import { allBlocks } from "@/data/blocks";
import { toast } from "sonner";
import { useSimulationTimer } from "@/hooks/useSimulationTimer";
import { trackSimulationCompleted } from "@/utils/analytics";

export default function FormLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const [showWaitingMessage, setShowWaitingMessage] = useState(false);
  const [actualSubmissionId, setActualSubmissionId] = useState<string | null>(null);
  const submissionStartedRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get global simulation timer for completion event
  const { getTotalTimeSpent } = useSimulationTimer();
  
  // Get form data from location state - handle both possible formats
  const formData = location.state?.formData as {
    responses: FormResponse;
    activeBlocks: string[];
    completedBlocks: string[];
    dynamicBlocks: any[];
    submissionId?: string;
  };
  
  useEffect(() => {
    // Enhanced validation - if no form data, redirect to home
    if (!formData || !formData.responses || !formData.activeBlocks) {
      console.error("FormLoading: No valid form data found, redirecting to home");
      navigate("/");
      return;
    }
    
    // Prevent multiple submissions - check if submission already started
    if (submissionStartedRef.current) {
      console.log("FormLoading: Submission already in progress, skipping");
      return;
    }
    
    console.log("FormLoading: Starting form submission process");
    submissionStartedRef.current = true;
    handleFormSubmission();
    startProgressAnimation();
    
    // Cleanup function
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [formData, navigate]);

  // Effetto per gestire quando il progresso raggiunge il 100%
  useEffect(() => {
    if (loadingProgress >= 100) {
      if (submissionCompleted && actualSubmissionId) {
        // Entrambe le condizioni sono soddisfatte, naviga
        setTimeout(() => {
          navigate("/form-completed", { 
            state: { 
              submissionData: {
                id: actualSubmissionId,
                submissionId: actualSubmissionId, // Include both for compatibility
                ...formData,
                submissionTime: new Date().toISOString()
              }
            }
          });
        }, 300);
      } else {
        // Progresso completato ma submission ancora in corso
        setShowWaitingMessage(true);
      }
    }
  }, [loadingProgress, submissionCompleted, actualSubmissionId, navigate, formData]);

  // Effetto per gestire quando la submission è completata
  useEffect(() => {
    if (submissionCompleted && loadingProgress >= 100 && actualSubmissionId) {
      // Entrambe le condizioni sono soddisfatte, nascondi il messaggio di attesa
      setShowWaitingMessage(false);
      
      setTimeout(() => {
        navigate("/form-completed", { 
          state: { 
            submissionData: {
              id: actualSubmissionId,
              submissionId: actualSubmissionId, // Include both for compatibility
              ...formData,
              submissionTime: new Date().toISOString()
            }
          }
        });
      }, 300);
    }
  }, [submissionCompleted, loadingProgress, actualSubmissionId, navigate, formData]);

  const handleFormSubmission = async () => {
    try {
      console.log("FormLoading: Beginning form submission to Supabase");
      console.log("FormLoading: Form responses:", Object.keys(formData.responses).length);
      console.log("FormLoading: Active blocks:", formData.activeBlocks.length);
      console.log("FormLoading: Dynamic blocks:", formData.dynamicBlocks?.length || 0);
      
      // Combine all blocks for submission service
      const allAvailableBlocks = [...allBlocks, ...(formData.dynamicBlocks || [])];
      console.log("FormLoading: Total blocks available:", allAvailableBlocks.length);
      
      // Create form state for submission service with proper types
      const formStateForSubmission = {
        activeBlocks: formData.activeBlocks,
        responses: formData.responses,
        completedBlocks: formData.completedBlocks,
        dynamicBlocks: formData.dynamicBlocks,
        activeQuestion: { block_id: '', question_id: '' },
        answeredQuestions: new Set<string>(), // Fix: Properly type the Set as Set<string>
        navigationHistory: [],
        blockActivations: {},
        pendingRemovals: []
      };
      
      const result = await submitFormToSupabase(formStateForSubmission, allAvailableBlocks);
      
      if (result.success && result.submissionId) {
        console.log("FormLoading: Form submitted successfully, ID:", result.submissionId);
        
        // Track successful completion with total time spent from simulation start
        const totalTimeSpent = getTotalTimeSpent();
        trackSimulationCompleted(totalTimeSpent);
        
        setActualSubmissionId(result.submissionId);
        setSubmissionCompleted(true);
        setShowWaitingMessage(false);
      } else {
        console.error("FormLoading: Submission failed:", result.error);
        toast.error("Errore durante l'invio", {
          description: result.error || "Si è verificato un errore durante l'invio del modulo."
        });
        navigate(-1);
      }
      
    } catch (error) {
      console.error('FormLoading: Unexpected error during submission:', error);
      toast.error("Errore durante l'invio", {
        description: "Si è verificato un errore imprevisto. Riprova più tardi."
      });
      navigate(-1);
    }
  };

  const startProgressAnimation = () => {
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
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }
    }, intervalTime);
  };

  // Determina il messaggio da mostrare
  const getDisplayMessage = () => {
    if (showWaitingMessage) {
      return "Quasi finito... attendi";
    }
    return "Stiamo elaborando la tua richiesta";
  };

  const getDisplayDescription = () => {
    if (showWaitingMessage) {
      return "Finalizzazione in corso...";
    }
    return "I tuoi dati vengono salvati in modo sicuro. Tra un momento verrai reindirizzato.";
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
                indicatorClassName="bg-[#245C4F] transition-all duration-75 ease-linear"
              />
              <p className="text-sm text-gray-600 font-medium">
                {Math.round(loadingProgress)}% completato
              </p>
              
              <p className="text-xs text-gray-500">
                {showWaitingMessage ? "Finalizzazione..." : "Salvataggio dati..."}
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
