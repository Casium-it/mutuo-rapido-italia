
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { resumeSimulation } from "@/services/resumeSimulationService";
import { setResumeContext } from "@/services/saveSimulationService";

export default function ResumeSimulation() {
  const navigate = useNavigate();
  const [resumeCode, setResumeCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeCode.trim()) {
      setCodeError("Inserisci il codice di ripresa");
      return;
    }

    if (resumeCode.trim().length !== 8) {
      setCodeError("Il codice deve essere di 8 caratteri");
      return;
    }

    setIsLoading(true);
    setCodeError("");

    try {
      console.log("🔍 Attempting to resume simulation with code:", resumeCode);
      
      const result = await resumeSimulation(resumeCode.trim());

      if (result.success && result.data) {
        console.log("✅ Simulation resumed successfully");
        
        // Store resume data in sessionStorage for FormProvider to pick up
        sessionStorage.setItem('resumeData', JSON.stringify({
          code: resumeCode.trim().toUpperCase(),
          formState: result.data.formState,
          contactInfo: result.data.contactInfo
        }));
        
        // Store resume context for pre-population in save dialog
        setResumeContext(resumeCode.trim().toUpperCase(), result.data.contactInfo);
        
        toast.success("Simulazione caricata con successo!");
        
        // Extract the active question from the resumed form state
        const { activeQuestion } = result.data.formState;
        const targetUrl = `/simulazione/${result.data.formSlug}/${activeQuestion.block_id}/${activeQuestion.question_id}`;
        
        console.log("🎯 Navigating to specific question:", targetUrl);
        
        // Navigate to the specific block and question where user left off
        navigate(targetUrl);
      } else {
        console.error("❌ Resume failed:", result.error);
        setCodeError(result.error || "Codice non valido o scaduto");
        toast.error(result.error || "Impossibile caricare la simulazione");
      }
    } catch (error) {
      console.error("❌ Resume error:", error);
      setCodeError("Errore imprevisto durante il caricamento");
      toast.error("Errore imprevisto durante il caricamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    setResumeCode(value);
    if (codeError) {
      setCodeError("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 flex justify-between items-center">
        <Logo />
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-2xl mx-auto w-full">
        <div className="bg-white rounded-[12px] border border-[#BEB8AE] shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] transition-all p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
              Riprendi la tua simulazione
            </h1>
            <p className="text-gray-600">
              Inserisci il codice di 8 caratteri che hai ricevuto per continuare la tua simulazione
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-gray-700">
                Codice di ripresa
              </Label>
              <Input
                id="code"
                type="text"
                value={resumeCode}
                onChange={handleCodeChange}
                placeholder="ABC12345"
                disabled={isLoading}
                className={`
                  text-center text-lg font-mono tracking-wider uppercase
                  px-[18px] py-[12px] border-[1.5px] rounded-[10px] 
                  font-medium transition-all
                  shadow-[0_3px_0_0_#AFA89F] mb-[10px] w-full h-auto
                  hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]
                  focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#245C4F]
                  ${codeError ? 'border-red-500' : 'border-[#BEB8AE]'}
                  ${resumeCode ? 'border-[#245C4F] bg-gray-50' : 'border-[#BEB8AE]'}
                `}
                maxLength={8}
              />
              {codeError && (
                <p className="text-red-500 text-sm">{codeError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !resumeCode.trim()}
              className="w-full px-[32px] py-[14px] border-[1.5px] rounded-[10px] 
                font-['Inter'] text-[17px] font-medium transition-all
                shadow-[0_3px_0_0_#1a453e] mb-[10px]
                hover:shadow-[0_3px_4px_rgba(36,92,79,0.25)]
                active:shadow-[0_1px_0_0_#1a453e] active:translate-y-[2px]
                inline-flex items-center justify-center gap-[12px]
                bg-[#245C4F] text-white border-[#245C4F]
                hover:bg-[#1e4f44]
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Caricamento...
                </>
              ) : (
                <>
                  Carica simulazione
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Non hai ancora una simulazione salvata?
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="text-[#245C4F] border-[#245C4F] hover:bg-[#245C4F] hover:text-white"
            >
              Inizia una nuova simulazione
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
