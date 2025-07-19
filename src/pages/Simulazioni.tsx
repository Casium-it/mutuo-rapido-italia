import React from "react";
import { Logo } from "@/components/Logo";
import { PathOption } from "@/components/PathOption";
import { Clock, Percent, Building2, Calculator, Check, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
const Simulazioni = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  // ORIGINAL FULL KEY POINTS (preserved for future restoration):
  /* 
  const simpleKeyPointsFull = [{
    icon: Clock,
    text: "minuti per completare",
    highlight: "2"
  }, {
    icon: Building2,
    text: "banche, offerte e condizioni confrontate",
    highlight: "48"
  }, {
    icon: Percent,
    text: "di precisione",
    highlight: "68%"
  }, {
    icon: Calculator,
    text: "Solo calcolatore fattibilità mutuo"
  }];
  
  const advancedKeyPointsFull = [{
    icon: Clock,
    text: "minuti per completare",
    highlight: "6"
  }, {
    icon: Building2,
    text: "banche, offerte e condizioni confrontate",
    highlight: "108"
  }, {
    icon: Percent,
    text: "di precisione (il migliore in Italia!)",
    highlight: "98%"
  }, {
    icon: Check,
    text: "Ottieni il tuo mutuo 100% online"
  }];
  */

  // SIMPLIFIED KEY POINTS (only time and precision):
  const simpleKeyPoints = [{
    icon: Clock,
    text: "minuti per completare",
    highlight: "2"
  }, {
    icon: Percent,
    text: "di precisione",
    highlight: "68%"
  }, {
    icon: User,
    text: "opzione di consulenza gratuita"
  }];
  
  const advancedKeyPoints = [{
    icon: Clock,
    text: "minuti per completare",
    highlight: "6"
  }, {
    icon: Percent,
    text: "di precisione (il migliore in Italia!)",
    highlight: "98%"
  }, {
    icon: User,
    text: "opzione di consulenza gratuita"
  }];
  const handlePathSelect = (path: string) => {
    navigate(path);
  };
  return <div className="min-h-screen flex flex-col bg-[fff7f0] bg-[#fff7f0]">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-gray-700 hover:text-[#245C4F] font-medium transition-colors">
            Home
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            <span className="text-[#245C4F] font-bold">Trova il Mutuo Perfetto</span> Per Te
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Scegli il percorso più adatto alle tue esigenze
          </p>
        </div>

        {/* Background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-[#F0EAE0] to-[#E8F5E9] rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-[#E8F5E9] to-[#F0EAE0] rounded-full blur-3xl opacity-20 animate-float-rotate"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center md:items-stretch max-w-3xl mx-auto">
          {/* Simulazione Avanzata */}
          <PathOption title="Simulazione Avanzata" description="Analisi completa e mutuo 100% online" keyPoints={advancedKeyPoints} ctaLabel="Inizia Avanzata" variant="secondary" onClick={() => handlePathSelect("/simulazione-avanzata")} />

          {/* Simulazione Veloce */}
          <PathOption title="Simulazione Veloce" description="Analisi rapida prefattibilità mutuo" keyPoints={simpleKeyPoints} ctaLabel="Presto Disponibile" variant="primary" disabled={true} onClick={() => handlePathSelect("/simulazione/simulazione-mutuo-veloce/introduzione/tipo_mutuo")} />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto py-6 px-4 border-t border-[#BEB8AE]">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">© 2025 GoMutuo.it - Tutti i diritti riservati</p>
          <div className="flex gap-4">
            <button onClick={() => navigate("/privacy")} className="text-sm text-gray-600 hover:text-[#245C4F]">
              Privacy
            </button>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Termini</a>
            <a href="#" className="text-sm text-gray-600 hover:text-[#245C4F]">Contatti</a>
          </div>
        </div>
        
        {/* Registration Information */}
        <div className="border-t border-[#BEB8AE] pt-4">
          <p className="text-xs text-gray-500 mb-2">Registrato come:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">FILIPPO GIACOMETTI</p>
            <p>Viale dei Mille 142, Firenze, 50131, Italia</p>
            <p>P.IVA: 07438860483</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Simulazioni;