
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Loader } from "lucide-react";
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
        <div className="text-center space-y-6 max-w-md">
          <div className="flex flex-col items-center">
            <Loader className="h-16 w-16 text-[#245C4F] animate-spin" />
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
      
      {/* Footer */}
      <footer className="py-6 px-4 bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GoMutuo. Tutti i diritti riservati.</p>
        </div>
      </footer>
    </div>
  );
}
