
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Progress } from "@/components/ui/progress";
import { FormResponse } from "@/types/form";

export default function FormLoading() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Ottieni i dati del form dallo stato della location
  const formData = location.state?.formData as {
    responses: FormResponse;
    activeBlocks: string[];
    submissionId?: string;
  };
  
  useEffect(() => {
    // Se non ci sono dati del form, reindirizza alla home
    if (!formData) {
      navigate("/");
      return;
    }
    
    // Progresso della barra di caricamento da 0 a 100% in 2 secondi
    const totalDuration = 2000; // 2 secondi
    const intervalTime = 20; // Aggiorna ogni 20ms per un'animazione fluida
    const increment = 100 / (totalDuration / intervalTime);
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Naviga al completamento dopo aver raggiunto il 100%
          setTimeout(() => {
            navigate("/form-completed", { 
              state: { 
                submissionData: {
                  ...formData,
                  submissionTime: new Date().toISOString()
                }
              }
            });
          }, 100); // Piccola pausa per mostrare il 100%
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);
    
    return () => {
      clearInterval(progressInterval);
    };
  }, [formData, navigate]);

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
              Stiamo elaborando la tua richiesta
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              I tuoi dati vengono salvati in modo sicuro. Tra un momento verrai reindirizzato.
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
