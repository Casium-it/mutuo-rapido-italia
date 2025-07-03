
import React, { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Badge, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge as UIBadge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { trackSimulationStart } from "@/utils/analytics";

const SimulazioneAvanzata = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  
  // Initialize time tracking for simulazione avanzata page
  const { trackCustomExit } = useTimeTracking({ 
    pageName: 'simulazione_avanzata'
  });
  
  // Effetto per controllare e gestire lo slug (removed leads table functionality)
  useEffect(() => {
    if (slug) {
      // Salva lo slug in localStorage per un uso futuro
      localStorage.setItem('user_slug', slug);
      
      // Note: Lead information retrieval has been removed as the leads table was deleted
      // Users coming with a slug will still have it saved for potential future use
      console.log('Slug saved to localStorage:', slug);
    }
  }, [slug]);
  
  // Funzione per gestire l'avvio del form unificato
  const startMortgageSimulation = () => {
    // Track simulation start
    trackSimulationStart("Simulazione Mutuo");
    trackCustomExit('simulation_start');
    
    // Clear any existing form state for simulazione-mutuo
    localStorage.removeItem('form-state-simulazione-mutuo');
    localStorage.removeItem('form-state-simulazione');
    
    // Navigate to the unified database-driven form
    navigate('/form/simulazione-mutuo');
  };

  // Function to handle surroga form navigation
  const startSurrogaForm = () => {
    // Track simulation start
    trackSimulationStart("Surroga al mio mutuo");
    trackCustomExit('simulation_start');
    
    // Clear any existing surroga form state
    localStorage.removeItem('form-state-surroga');
    
    // Navigate to the database-driven surroga form
    navigate('/form/surroga');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 flex justify-between items-center">
        <Logo onClick={() => navigate("/")} />
        <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-vibe-green">
          Accedi
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-3xl mx-auto w-full">
        {/* Welcome message (removed lead info since leads table was deleted) */}
        {slug && (
          <div className="mb-6 p-4 bg-[#245C4F]/10 rounded-lg text-center">
            <h2 className="text-xl font-medium mb-1 text-[#245C4F]">Bentornato!</h2>
            <p className="text-sm text-gray-600">Completa la tua simulazione per un mutuo su misura.</p>
          </div>
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
          Benvenuto in <span className="gradient-text">GoMutuo</span>
        </h1>
        <p className="text-base text-gray-600 mb-10 text-center font-semibold">Da dove partiamo?</p>
        
        <div className="space-y-4">
          {/* Unified mortgage simulation option */}
          <OptionCard
            icon={Home}
            title="Simulazione Mutuo"
            description="Trova il mutuo perfetto per la tua situazione"
            href="/form/simulazione-mutuo"
            onClick={startMortgageSimulation}
          />
          
          <OptionCard
            icon={Badge}
            title="Surroga al mio mutuo"
            description="Voglio rinegoziare il mio mutuo"
            href="/form/surroga"
            onClick={startSurrogaForm}
          />
        </div>
        
        {/* Resume simulation link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/riprendi-simulazione")}
            className="inline-flex items-center gap-2 text-[#245C4F] font-bold hover:underline transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Riprendi simulazione salvata con il codice simulazione QUI
          </button>
        </div>
      </main>
    </div>
  );
};

// Componente per le opzioni
interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  href: string;
  disabled?: boolean;
  badge?: string;
  onClick?: () => void;
}

const OptionCard = ({ icon: Icon, title, description, href, disabled = false, badge, onClick }: OptionCardProps) => {
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-5 bg-white rounded-[12px] border border-[#BEB8AE] ${
        disabled 
          ? "opacity-80 cursor-not-allowed" 
          : "hover:shadow-md transition-all group cursor-pointer shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {!isMobile && (
          <div className={`text-gray-600 flex-shrink-0 ${disabled ? "opacity-60" : ""}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="text-left">
          <h3 className={`text-lg font-semibold font-['Inter'] ${disabled ? "text-gray-600" : "text-gray-900"}`}>{title}</h3>
          {description && <p className={`text-sm font-['Inter'] ${disabled ? "text-gray-500" : "text-gray-500"} mt-0.5`}>{description}</p>}
          {badge && (
            <UIBadge variant="outline" className="mt-2 text-xs bg-gray-100 text-gray-600 font-normal">
              {badge}
            </UIBadge>
          )}
        </div>
      </div>
      <div className={`${disabled ? "bg-gray-300" : "bg-[#245C4F] hover:bg-[#1e4f44]"} p-3 rounded-[10px] transition-colors flex items-center justify-center ml-2 flex-shrink-0 shadow-[0_3px_0_0_#1a453e]`}>
        <ArrowRight className={`w-5 h-5 ${disabled ? "text-gray-100" : "text-white"}`} />
      </div>
    </div>
  );
};

export default SimulazioneAvanzata;
