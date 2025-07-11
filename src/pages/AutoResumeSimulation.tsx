import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resumeSimulation } from "@/services/resumeSimulationService";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

export default function AutoResumeSimulation() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResume = async () => {
      if (!code) {
        setError("Codice di ripresa mancante");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Auto-resuming simulation with code:", code);
        
        const result = await resumeSimulation(code);
        
        if (result.success && result.data) {
          // Save form state to localStorage
          const stateToSave = {
            ...result.data.formState,
            answeredQuestions: Array.from(result.data.formState.answeredQuestions)
          };
          
          localStorage.setItem(`form-state-${result.data.formSlug}`, JSON.stringify(stateToSave));
          
          // Save resume metadata for the save dialog to detect this is a resumed simulation
          const resumeMetadata = {
            resumeCode: code.toUpperCase(),
            contactInfo: {
              name: result.data.contactInfo.name,
              phone: result.data.contactInfo.phone,
              email: result.data.contactInfo.email
            },
            isFromResume: true
          };
          
          localStorage.setItem('resumeMetadata', JSON.stringify(resumeMetadata));
          
          toast.success(`Bentornato ${result.data.contactInfo.name}! Simulazione ripristinata.`);
          
          // Navigate to the form at the correct question
          const { activeQuestion } = result.data.formState;
          navigate(`/simulazione/${result.data.formSlug}/${activeQuestion.block_id}/${activeQuestion.question_id}`);
        } else {
          setError(result.error || "Simulazione non trovata o scaduta");
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auto-resume error:', error);
        setError("Si è verificato un errore nel caricamento della simulazione");
        setIsLoading(false);
      }
    };

    handleResume();
  }, [code, navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
        <header className="py-6 px-4 md:px-6">
          <Logo onClick={handleGoHome} />
        </header>
        
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#245C4F]" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Caricamento simulazione...
            </h1>
            <p className="text-gray-600">
              Stiamo ripristinando la tua simulazione
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      <header className="py-6 px-4 md:px-6">
        <Logo onClick={handleGoHome} />
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white p-6 rounded-[12px] border border-[#BEB8AE] shadow-[0_3px_0_0_#AFA89F]">
            <h1 className="text-xl font-semibold text-gray-900 mb-4">
              Simulazione non trovata
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "La simulazione richiesta non è stata trovata o è scaduta."}
            </p>
            <button
              onClick={handleGoHome}
              className="w-full bg-[#245C4F] hover:bg-[#1e4f44] text-white font-medium py-3 px-4 rounded-lg shadow-[0_3px_0_0_#1a453e] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a453e] transition-all"
            >
              Torna alla home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
