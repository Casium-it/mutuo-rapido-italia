
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
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
    
    // Simula un caricamento progressivo
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    
    // Imposta un timer minimo di 3 secondi prima di navigare alla pagina di completamento
    const minLoadingTime = setTimeout(() => {
      // Assicurati che il progresso sia completato
      if (loadingProgress >= 100) {
        navigateToCompletion();
      } else {
        // Altrimenti attendi che il progresso raggiunga 100%
        const checkProgress = setInterval(() => {
          if (loadingProgress >= 100) {
            clearInterval(checkProgress);
            navigateToCompletion();
          }
        }, 100);
      }
    }, 3000);
    
    const navigateToCompletion = () => {
      navigate("/form-completed", { 
        state: { 
          submissionData: {
            ...formData,
            submissionTime: new Date().toISOString()
          }
        }
      });
    };
    
    return () => {
      clearInterval(progressInterval);
      clearTimeout(minLoadingTime);
    };
  }, [formData, navigate, loadingProgress]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="py-3 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-200">
        <Logo />
      </header>

      {/* Contenuto principale */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="text-center space-y-12 max-w-md">
          {/* Primo loader con animazione */}
          <div className="flex flex-col items-center">
            <div className="dots-loader mb-8"></div>
            <div className="text-loader mb-4"></div>
            <div className="mt-6 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-[#245C4F] h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="mt-3 text-sm text-gray-500">{loadingProgress}%</p>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Stiamo elaborando la tua richiesta
          </h1>
          <p className="text-lg text-gray-600">
            I tuoi dati vengono salvati in modo sicuro. Tra un momento verrai reindirizzato.
          </p>
        </div>
      </div>
      
      {/* Style per i loader personalizzati */}
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
        
        /* Text loader animation */
        .text-loader {
          width: fit-content;
          font-size: 24px;
          font-family: monospace;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0 auto;
          color: #0000;
          -webkit-text-stroke: 1px #245C4F;
          --g: conic-gradient(#245C4F 0 0) no-repeat text;
          background: var(--g) 0, var(--g) 1ch, var(--g) 2ch, var(--g) 3ch, 
                     var(--g) 4ch, var(--g) 5ch, var(--g) 6ch, var(--g) 7ch, 
                     var(--g) 8ch, var(--g) 9ch, var(--g) 10ch;
          background-position-y: 100%;
          animation: textAnim 3s infinite;
        }
        .text-loader:before {
          content: "CARICAMENTO";
        }
        @keyframes textAnim {
          0%     {background-size: 1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0}
          9.09%  {background-size: 1ch 100%, 1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0}
          18.18% {background-size: 1ch 100%, 1ch 100%, 1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0}
          27.27% {background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0}
          36.36% {background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0}
          45.45% {background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0}
          54.54% {background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 0,   1ch 0,   1ch 0,   1ch 0,   1ch 0}
          63.63% {background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 0,   1ch 0,   1ch 0,   1ch 0}
          72.72% {background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 0,   1ch 0,   1ch 0}
          81.81% {background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 0,   1ch 0}
          90.90% {background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 0}
          100%   {background-size: 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%, 1ch 100%}
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
