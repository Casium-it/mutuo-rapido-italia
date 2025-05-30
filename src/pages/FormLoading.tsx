
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Progress } from "@/components/ui/progress";
import { FormResponse } from "@/types/form";
import { submitFormToSupabase } from "@/services/formSubmissionService";
import { toast } from "sonner";

export default function FormLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const [showWaitingMessage, setShowWaitingMessage] = useState(false);
  const submissionStartedRef = useRef(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ottieni i dati del form dallo stato della location
  const formData = location.state?.formData as {
    responses: FormResponse;
    activeBlocks: string[];
    completedBlocks: string[];
    dynamicBlocks: any[];
    submissionId?: string;
  };
  
  useEffect(() => {
    // Se non ci sono dati del form, reindirizza alla home
    if (!formData) {
      navigate("/");
      return;
    }
    
    // Avvia la submission se non è già stata avviata
    if (!submissionStartedRef.current) {
      submissionStartedRef.current = true;
      handleFormSubmission();
    }
    
    // Avvia l'animazione della barra di progresso per 5 secondi
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
      if (submissionCompleted) {
        // Entrambe le condizioni sono soddisfatte, naviga
        setTimeout(() => {
          navigate("/form-completed", { 
            state: { 
              submissionData: {
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
  }, [loadingProgress, submissionCompleted, navigate, formData]);

  // Effetto per gestire quando la submission è completata
  useEffect(() => {
    if (submissionCompleted && loadingProgress >= 100) {
      // Entrambe le condizioni sono soddisfatte, nascondi il messaggio di attesa
      setShowWaitingMessage(false);
      
      setTimeout(() => {
        navigate("/form-completed", { 
          state: { 
            submissionData: {
              ...formData,
              submissionTime: new Date().toISOString()
            }
          }
        });
      }, 300);
    }
  }, [submissionCompleted, loadingProgress, navigate, formData]);

  const handleFormSubmission = async () => {
    try {
      console.log("Inizio invio form dal FormLoading...");
      
      // Ottieni tutti i blocchi (statici + dinamici) per il servizio di submission
      const allBlocks = [...(window as any).allBlocks || [], ...(formData.dynamicBlocks || [])];
      
      const result = await submitFormToSupabase({
        activeBlocks: formData.activeBlocks,
        responses: formData.responses,
        completedBlocks: formData.completedBlocks,
        dynamicBlocks: formData.dynamicBlocks,
        activeQuestion: { block_id: '', question_id: '' },
        answeredQuestions: new Set(),
        navigationHistory: [],
        blockActivations: {},
        pendingRemovals: []
      }, allBlocks);
      
      if (result.success) {
        console.log("Form inviato con successo, ID:", result.submissionId);
        setSubmissionCompleted(true);
        setShowWaitingMessage(false);
      } else {
        console.error("Errore nell'invio:", result.error);
        toast.error("Errore durante l'invio", {
          description: result.error || "Si è verificato un errore durante l'invio del modulo."
        });
        // In caso di errore, torna alla pagina precedente
        navigate(-1);
      }
      
    } catch (error) {
      console.error('Errore imprevisto durante l\'invio del form:', error);
      toast.error("Errore durante l'invio", {
        description: "Si è verificato un errore imprevisto. Riprova più tardi."
      });
      // In caso di errore, torna alla pagina precedente
      navigate(-1);
    }
  };

  const startProgressAnimation = () => {
    const totalDuration = 5000; // 5 secondi esatti
    const intervalTime = 50; // Aggiorna ogni 50ms
    const totalSteps = totalDuration / intervalTime; // 100 step totali
    const progressPerStep = 100 / totalSteps; // 1% per step
    
    let currentStep = 0;
    
    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(currentStep * progressPerStep, 100);
      
      setLoadingProgress(newProgress);
      
      // Se abbiamo raggiunto il 100%, ferma l'animazione
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

      {/* Contenuto principale */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center space-y-8 max-w-md w-full">
          {/* Loader con animazione */}
          <div className="flex flex-col items-center">
            <div className="dots-loader mb-8"></div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {getDisplayMessage()}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              {getDisplayDescription()}
            </p>
            
            {/* Barra di progresso con shadcn/ui */}
            <div className="w-full space-y-3">
              <Progress 
                value={loadingProgress} 
                className="h-3 bg-gray-200"
                indicatorClassName="bg-[#245C4F] transition-all duration-75 ease-linear"
              />
              <p className="text-sm text-gray-600 font-medium">
                {Math.round(loadingProgress)}% completato
              </p>
              
              {/* Indicatore fase */}
              <p className="text-xs text-gray-500">
                {showWaitingMessage ? "Finalizzazione..." : "Salvataggio dati..."}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Style per il loader personalizzato */}
      <style>
        {`
        /* Dots loader animation */
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
