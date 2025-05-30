
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
  const [isInFinalPhase, setIsInFinalPhase] = useState(false);
  const submissionStartedRef = useRef(false);
  const finalPhaseStartedRef = useRef(false);
  
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
    
    // Avvia l'animazione della barra di progresso per upload (0-90%)
    startUploadProgressAnimation();
    
  }, [formData, navigate]);

  // Effetto per gestire la fase finale quando la submission è completata
  useEffect(() => {
    if (submissionCompleted && !isInFinalPhase && !finalPhaseStartedRef.current) {
      finalPhaseStartedRef.current = true;
      // Assicurati che siamo al 90% prima di iniziare la fase finale
      setLoadingProgress(90);
      setIsInFinalPhase(true);
      
      // Avvia la fase finale di 4 secondi (90% -> 100%)
      setTimeout(() => {
        startFinalPhaseAnimation();
      }, 100); // Piccola pausa per assicurarsi che il progresso sia aggiornato al 90%
    }
  }, [submissionCompleted, isInFinalPhase]);

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

  const startUploadProgressAnimation = () => {
    const uploadDuration = 3000; // 3 secondi per raggiungere il 90%
    const intervalTime = 50; // Aggiorna ogni 50ms
    const totalSteps = uploadDuration / intervalTime;
    
    let currentStep = 0;
    
    const uploadInterval = setInterval(() => {
      currentStep++;
      
      // Funzione di easing: inizia lento, poi accelera
      const progress = currentStep / totalSteps;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      
      // Calcola il progresso da 0% a 90%
      const targetProgress = Math.min(easedProgress * 90, 90);
      
      setLoadingProgress(prev => {
        // Se la submission è già completata e siamo vicini al 90%, fermiamoci al 90%
        if (submissionCompleted && prev >= 85) {
          clearInterval(uploadInterval);
          return 90;
        }
        
        return Math.max(prev, targetProgress);
      });
      
      // Se abbiamo raggiunto il 90% o il tempo è scaduto
      if (targetProgress >= 90 || currentStep >= totalSteps) {
        clearInterval(uploadInterval);
        setLoadingProgress(90);
      }
    }, intervalTime);
    
    return () => {
      clearInterval(uploadInterval);
    };
  };

  const startFinalPhaseAnimation = () => {
    const finalPhaseDuration = 4000; // Esattamente 4 secondi per 90% -> 100%
    const intervalTime = 50; // Aggiorna ogni 50ms
    const totalSteps = finalPhaseDuration / intervalTime;
    
    let currentStep = 0;
    
    const finalInterval = setInterval(() => {
      currentStep++;
      
      // Progresso lineare da 90% a 100% in 4 secondi
      const progress = currentStep / totalSteps;
      const targetProgress = 90 + (progress * 10); // Da 90 a 100
      
      setLoadingProgress(Math.min(targetProgress, 100));
      
      // Quando raggiungiamo il 100% o il tempo è scaduto
      if (targetProgress >= 100 || currentStep >= totalSteps) {
        clearInterval(finalInterval);
        setLoadingProgress(100);
        
        // Naviga al completamento dopo una breve pausa per mostrare il 100%
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
    }, intervalTime);
    
    return () => {
      clearInterval(finalInterval);
    };
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
              {isInFinalPhase ? "Completamento in corso..." : "Stiamo elaborando la tua richiesta"}
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              {isInFinalPhase 
                ? "Finalizzazione della procedura..." 
                : "I tuoi dati vengono salvati in modo sicuro. Tra un momento verrai reindirizzato."
              }
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
                {!submissionCompleted && "Salvataggio dati..."}
                {submissionCompleted && !isInFinalPhase && "Preparazione completamento..."}
                {isInFinalPhase && "Finalizzazione..."}
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
