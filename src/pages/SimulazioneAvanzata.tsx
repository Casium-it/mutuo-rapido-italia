
import React from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, LightbulbIcon, Search, Home, Check, Badge } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge as UIBadge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { allBlocks } from "@/data/blocks";

const SimulazioneAvanzata = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Funzione per gestire l'avvio di un nuovo form
  const startNewForm = (path: string, additionalBlocks: string[] = []) => {
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
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
      {/* Header */}
      <header className="py-6 px-4 md:px-6 flex justify-between items-center">
        <Logo />
        <Button variant="ghost" className="text-gray-700 hover:bg-transparent hover:text-vibe-green">
          Accedi
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 py-8 md:py-12 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
          Benvenuto in <span className="gradient-text">GoMutuo</span>
        </h1>
        <p className="text-base text-gray-600 mb-10 text-center font-semibold">Da dove partiamo?</p>
        
        <div className="space-y-4">
          <OptionCard
            icon={LightbulbIcon}
            title="Mi sto guardando intorno"
            description="Non ho ancora iniziato le visite"
            href="/simulazione/pensando/introduzione/soggetto_acquisto"
            onClick={() => startNewForm("/simulazione/pensando/introduzione/soggetto_acquisto", ["la_tua_ricerca_casa"])}
          />
          
          <OptionCard
            icon={Search}
            title="Sto cercando attivamente"
            description="Ho già iniziato o pianificato le visite"
            href="/simulazione/cercando/introduzione/soggetto_acquisto"
            onClick={() => startNewForm("/simulazione/cercando/introduzione/soggetto_acquisto", ["la_tua_ricerca_casa"])}
          />
          
          <OptionCard
            icon={Home}
            title="Ho individuato una casa"
            description="Ho trovato l'immobile ideale"
            href="/simulazione/individuata/introduzione/soggetto_acquisto"
            onClick={() => startNewForm("/simulazione/individuata/introduzione/soggetto_acquisto", ["la_casa_individuata"])}
          />
          
          <OptionCard
            icon={Check}
            title="Ho fatto un'offerta"
            description="Sono in attesa che l'offerta venga accettata"
            href="/simulazione/offerta/introduzione/soggetto_acquisto"
            onClick={() => startNewForm("/simulazione/offerta/introduzione/soggetto_acquisto", ["la_tua_offerta"])}
          />
          
          <OptionCard
            icon={Badge}
            title="Ho un'offerta accettata"
            description="Sono sicuro dell'immobile"
            href="/simulazione/accettata/introduzione/soggetto_acquisto"
            onClick={() => startNewForm("/simulazione/accettata/introduzione/soggetto_acquisto", ["la_tua_offerta"])}
          />
          
          <OptionCard
            icon={Badge}
            title="Surroga al mio mutuo"
            description="Voglio rinegoziare il mio mutuo"
            href="/simulazione/surroga"
            disabled={true}
            badge="Presto disponibile"
          />
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
