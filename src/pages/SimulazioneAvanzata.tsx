
import React, { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, LightbulbIcon, Search, Home, Check, Badge, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge as UIBadge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { allBlocks } from "@/data/blocks";
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
  
  // Funzione per gestire l'avvio di un nuovo form
  const startNewForm = (path: string, additionalBlocks: string[] = [], optionTitle: string) => {
    // Track simulation start with the selected option
    trackSimulationStart(optionTitle);
    
    // Track custom exit since user is navigating to simulation
    trackCustomExit('simulation_start');
    
    // Rimuoviamo qualsiasi dato salvato in localStorage per i vari tipi di form
    const pathSegments = path.split('/');
    const formType = pathSegments[pathSegments.length - 3]; // Estrai il tipo (pensando, cercando, offerta, ecc.)
    
    // Rimuovi tutti i dati salvati dal localStorage per questo tipo di form
    localStorage.removeItem(`form-state-${formType}`);
    
    // Trova tutti i blocchi che sono attivi di default
    const defaultActiveBlocks = allBlocks
      .filter(block => block.default_active)
      .map(block => block.block_id);
    
    // Crea uno stato iniziale con i blocchi di default attivi e i blocchi aggiuntivi
    const initialState = {
      activeBlocks: [...defaultActiveBlocks, ...additionalBlocks],
      activeQuestion: {
        block_id: "introduzione", // Usiamo introduzione come blocco iniziale
        question_id: "soggetto_acquisto" // Prima domanda del blocco introduzione
      },
      responses: {},
      answeredQuestions: []
    };
    
    // Salva questo stato iniziale nel localStorage
    localStorage.setItem(`form-state-${formType}`, JSON.stringify(initialState));
    
    // Naviga al percorso specificato
    navigate(path);
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
          {/* Resume simulation option */}
          <OptionCard
            icon={LightbulbIcon}
            title="Mi sto guardando intorno"
            description="Non ho ancora iniziato le visite"
            href="/simulazione/pensando/introduzione/soggetto_acquisto"
            onClick={() => startNewForm(
              "/simulazione/pensando/introduzione/soggetto_acquisto", 
              ["la_tua_ricerca_casa"],
              "Mi sto guardando intorno"
            )}
          />
          
          <OptionCard
            icon={Search}
            title="Sto cercando attivamente"
            description="Ho già iniziato o pianificato le visite"
            href="/simulazione/cercando/introduzione/soggetto_acquisto"
            onClick={() => startNewForm(
              "/simulazione/cercando/introduzione/soggetto_acquisto", 
              ["la_tua_ricerca_casa"],
              "Sto cercando attivamente"
            )}
          />
          
          <OptionCard
            icon={Home}
            title="Ho individuato una casa"
            description="Ho trovato l'immobile ideale"
            href="/simulazione/individuata/introduzione/soggetto_acquisto"
            onClick={() => startNewForm(
              "/simulazione/individuata/introduzione/soggetto_acquisto", 
              ["la_casa_individuata"],
              "Ho individuato una casa"
            )}
          />
          
          <OptionCard
            icon={Check}
            title="Ho fatto un'offerta"
            description="Sono in attesa dell'accettazione"
            href="/simulazione/offerta/introduzione/soggetto_acquisto"
            onClick={() => startNewForm(
              "/simulazione/offerta/introduzione/soggetto_acquisto", 
              ["la_tua_offerta"],
              "Ho fatto un'offerta"
            )}
          />
          
          <OptionCard
            icon={Badge}
            title="Ho un'offerta accettata"
            description="Sono sicuro dell'immobile"
            href="/simulazione/accettata/introduzione/soggetto_acquisto"
            onClick={() => startNewForm(
              "/simulazione/accettata/introduzione/soggetto_acquisto", 
              ["la_tua_offerta"],
              "Ho un'offerta accettata"
            )}
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
