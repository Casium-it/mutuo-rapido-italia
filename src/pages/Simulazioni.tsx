
import React from "react";
import { Logo } from "@/components/Logo";
import { Clock, Percent, ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

const Simulazioni = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const advancedKeyPoints = [
    { icon: Clock, text: "minuti per completare", highlight: "6" },
    { icon: Percent, text: "di precisione (il migliore in Italia!)", highlight: "98%" },
  ];

  const simpleKeyPoints = [
    { icon: Clock, text: "minuti per completare", highlight: "2" },
    { icon: Percent, text: "di precisione", highlight: "68%" },
  ];

  const handlePathSelect = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      {/* Header */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="cursor-pointer" onClick={() => navigate("/")}>
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="text-gray-700 hover:text-[#245C4F] font-medium transition-colors"
          >
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

        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Simulazione Avanzata - First */}
          <OptionCard 
            title="Simulazione Avanzata"
            description="Analisi completa e assistenza personalizzata"
            keyPoints={advancedKeyPoints}
            onClick={() => handlePathSelect("/simulazione-avanzata")}
            variant="advanced"
            badge="Consigliato"
          />

          {/* Simulazione Veloce - Second */}
          <OptionCard 
            title="Simulazione Veloce"
            description="Analisi rapida prefattibilità mutuo"
            keyPoints={simpleKeyPoints}
            onClick={() => handlePathSelect("/simulazione/simulazione-mutuo-veloce/introduzione/soggetto_acquisto")}
            variant="simple"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto py-6 px-4 border-t border-[#BEB8AE]">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">© 2025 GoMutuo.it - Tutti i diritti riservati</p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/privacy")}
              className="text-sm text-gray-600 hover:text-[#245C4F]"
            >
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
    </div>
  );
};

// Compact OptionCard component similar to SimulazioneAvanzata style
interface KeyPoint {
  icon: React.ElementType;
  text: string;
  highlight?: string;
}

interface OptionCardProps {
  title: string;
  description: string;
  keyPoints: KeyPoint[];
  onClick: () => void;
  variant: "advanced" | "simple";
  badge?: string;
}

const OptionCard = ({ 
  title, 
  description, 
  keyPoints,
  onClick,
  variant,
  badge
}: OptionCardProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className="flex items-center justify-between p-4 bg-white rounded-[12px] border border-[#BEB8AE] hover:shadow-md transition-all group cursor-pointer shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]" 
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold font-['Inter'] text-gray-900">{title}</h3>
          {badge && (
            <span className="bg-[#245C4F] text-white text-xs px-2 py-1 rounded-md font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm font-['Inter'] text-gray-500 mb-3">{description}</p>
        
        {/* Key Points */}
        <div className="space-y-2">
          {keyPoints.map((point, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="rounded-full p-1 flex-shrink-0 text-[#245C4F] bg-[#F8F4EF]">
                <point.icon className="h-3 w-3" />
              </div>
              <div className="text-xs text-gray-700">
                {point.highlight ? (
                  <span>
                    <span className="font-semibold">{point.highlight}</span> {point.text}
                  </span>
                ) : (
                  point.text
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-[#245C4F] hover:bg-[#1e4f44] p-3 rounded-[10px] transition-colors flex items-center justify-center ml-4 flex-shrink-0 shadow-[0_3px_0_0_#1a453e]">
        <ArrowRight className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};

export default Simulazioni;
