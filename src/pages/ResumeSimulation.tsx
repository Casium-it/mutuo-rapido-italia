
import React, { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { loadSimulation } from "@/services/saveSimulationService";
import { toast } from "sonner";
import { Search, ArrowLeft } from "lucide-react";

export default function ResumeSimulation() {
  const navigate = useNavigate();
  const [resumeCode, setResumeCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeCode.trim()) {
      toast.error("Inserisci un codice di ripresa valido");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await loadSimulation(resumeCode.trim());
      
      if (result.success && result.data) {
        // Salva lo stato nel localStorage con il formSlug corretto
        const formSlug = result.data.formSlug;
        const stateToSave = {
          ...result.data.formState,
          answeredQuestions: Array.from(result.data.formState.answeredQuestions)
        };
        
        localStorage.setItem(`form-state-${formSlug}`, JSON.stringify(stateToSave));
        
        toast.success(`Bentornato ${result.data.contactInfo.name}! Simulazione ripristinata.`);
        
        // Naviga alla pagina del form nel punto giusto
        const { activeQuestion } = result.data.formState;
        navigate(`/simulazione/${formSlug}/${activeQuestion.block_id}/${activeQuestion.question_id}`);
      } else {
        toast.error(result.error || "Simulazione non trovata o scaduta");
      }
    } catch (error) {
      console.error('Errore nel caricamento:', error);
      toast.error("Si è verificato un errore nel caricamento della simulazione");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 flex justify-between items-center">
        <Logo onClick={() => navigate("/")} />
        <Button 
          variant="ghost" 
          className="text-gray-700 hover:bg-transparent hover:text-vibe-green"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna alla home
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-lg mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Riprendi la tua <span className="gradient-text">simulazione</span>
          </h1>
          <p className="text-base text-gray-600 font-semibold">
            Inserisci il codice che hai ricevuto per continuare da dove avevi lasciato
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-[12px] border border-[#BEB8AE] shadow-[0_3px_0_0_#AFA89F]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="resumeCode" className="text-sm font-medium text-gray-700">
                Codice di ripresa
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="resumeCode"
                  type="text"
                  placeholder="Inserisci il tuo codice (es. ABC123XY)"
                  value={resumeCode}
                  onChange={(e) => setResumeCode(e.target.value.toUpperCase())}
                  className="pl-10 h-12 text-center font-mono text-lg"
                  maxLength={8}
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Il codice è composto da 8 caratteri alfanumerici
              </p>
            </div>

            <Button 
              type="submit"
              disabled={isLoading || !resumeCode.trim()}
              className="w-full h-12 bg-[#245C4F] hover:bg-[#1e4f44] text-white font-medium shadow-[0_3px_0_0_#1a453e] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a453e] transition-all"
            >
              {isLoading ? 'Caricamento...' : 'Riprendi simulazione'}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Non hai un codice di ripresa?
          </p>
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
            className="border-[#245C4F] text-[#245C4F] hover:bg-[#245C4F] hover:text-white"
          >
            Inizia una nuova simulazione
          </Button>
        </div>
      </main>
    </div>
  );
}
