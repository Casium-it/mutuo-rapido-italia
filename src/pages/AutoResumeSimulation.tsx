
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resumeSimulation } from "@/services/resumeSimulationService";
import { setResumeContext } from "@/services/saveSimulationService";
import { useForm } from "@/contexts/FormContext";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

export default function AutoResumeSimulation() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { setFormState } = useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resumeUserSimulation = async () => {
      if (!code) {
        setError("Codice di ripresa mancante");
        setLoading(false);
        return;
      }

      console.log("🔄 Auto-resuming simulation with code:", code);

      try {
        const result = await resumeSimulation(code);

        if (result.success && result.data) {
          console.log("✅ Simulation resumed successfully, redirecting to form");
          
          // Set the form state from the resumed simulation
          setFormState(result.data.formState);
          
          // Store resume context for pre-population in save dialog
          setResumeContext(code, result.data.contactInfo);
          
          // Navigate to the form
          navigate(`/simulazione/${result.data.formSlug}`);
        } else {
          console.error("❌ Resume failed:", result.error);
          setError(result.error || "Errore durante il caricamento della simulazione");
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Auto-resume error:", error);
        setError("Errore imprevisto durante il caricamento");
        setLoading(false);
      }
    };

    resumeUserSimulation();
  }, [code, navigate, setFormState]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
        <header className="py-6 px-4 md:px-6 flex justify-between items-center">
          <Logo />
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#245C4F]" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Caricamento simulazione...
            </h1>
            <p className="text-gray-600">
              Stiamo riprendendo la tua simulazione
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
        <header className="py-6 px-4 md:px-6 flex justify-between items-center">
          <Logo />
        </header>

        <main className="flex-1 flex items-center justify-center px-4 md:px-6 py-8 md:py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-[12px] border border-[#BEB8AE] shadow-[0_3px_0_0_#AFA89F] p-8">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">
                Impossibile caricare la simulazione
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/riprendi")}
                  className="w-full px-4 py-3 bg-[#245C4F] text-white rounded-[10px] font-medium hover:bg-[#1e4f44] transition-colors shadow-[0_3px_0_0_#1a453e] hover:shadow-[0_3px_4px_rgba(36,92,79,0.25)] active:shadow-[0_1px_0_0_#1a453e] active:translate-y-[2px]"
                >
                  Inserisci il codice manualmente
                </button>
                
                <button
                  onClick={() => navigate("/")}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-[10px] font-medium hover:bg-gray-50 transition-colors"
                >
                  Torna alla home
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
