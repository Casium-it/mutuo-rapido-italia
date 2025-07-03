
import React, { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { trackSimulationStart } from "@/utils/analytics";
import { formCacheService } from "@/services/formCacheService";

const SimulazioneAvanzata = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  
  // Initialize time tracking for simulazione avanzata page
  const { trackCustomExit } = useTimeTracking({ 
    pageName: 'simulazione_avanzata'
  });
  
  // Effetto per controllare e gestire lo slug
  useEffect(() => {
    if (slug) {
      // Salva lo slug in localStorage per un uso futuro
      localStorage.setItem('user_slug', slug);
      console.log('Slug saved to localStorage:', slug);
    }
  }, [slug]);
  
  // Funzione per gestire l'avvio del form con blocchi cached
  const startSimulation = async () => {
    setLoading(true);
    
    try {
      // Track simulation start
      trackSimulationStart("Simulazione Mutuo");
      
      // Track custom exit since user is navigating to simulation
      trackCustomExit('simulation_start');
      
      // Load cached form to get default active blocks
      const cachedForm = await formCacheService.getForm('simulazione-mutuo');
      
      // Rimuovi qualsiasi dato salvato in localStorage per il form mutuo
      localStorage.removeItem('form-state-mutuo');
      
      // Trova tutti i blocchi che sono attivi di default dalla cache o fallback
      let defaultActiveBlocks = [];
      if (cachedForm && cachedForm.blocks.length > 0) {
        defaultActiveBlocks = cachedForm.blocks
          .filter(block => block.default_active)
          .map(block => block.block_id);
      } else {
        // Fallback to static blocks if cache fails
        const { allBlocks } = await import('@/data/blocks');
        defaultActiveBlocks = allBlocks
          .filter(block => block.default_active)
          .map(block => block.block_id);
      }
      
      // Crea uno stato iniziale con i blocchi di default attivi
      const initialState = {
        activeBlocks: defaultActiveBlocks,
        activeQuestion: {
          block_id: "introduzione",
          question_id: "soggetto_acquisto"
        },
        responses: {},
        answeredQuestions: []
      };
      
      // Salva questo stato iniziale nel localStorage
      localStorage.setItem('form-state-mutuo', JSON.stringify(initialState));
      
      // Naviga al percorso del form
      navigate('/simulazione/mutuo/introduzione/soggetto_acquisto');
    } catch (error) {
      console.error('Error starting simulation:', error);
      toast.error('Errore nel caricamento della simulazione');
    } finally {
      setLoading(false);
    }
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
        {/* Welcome message */}
        {slug && (
          <div className="mb-6 p-4 bg-[#245C4F]/10 rounded-lg text-center">
            <h2 className="text-xl font-medium mb-1 text-[#245C4F]">Bentornato!</h2>
            <p className="text-sm text-gray-600">Completa la tua simulazione per un mutuo su misura.</p>
          </div>
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
          Benvenuto in <span className="gradient-text">GoMutuo</span>
        </h1>
        <p className="text-base text-gray-600 mb-10 text-center font-semibold">Inizia la tua simulazione mutuo</p>
        
        <div className="space-y-4">
          {/* Single simulation option */}
          <OptionCard
            icon={Home}
            title="Simulazione Mutuo"
            description="Calcola il tuo mutuo personalizzato"
            onClick={startSimulation}
            loading={loading}
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

// Componente per l'opzione
interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  onClick: () => void;
  loading?: boolean;
}

const OptionCard = ({ icon: Icon, title, description, onClick, loading = false }: OptionCardProps) => {
  const isMobile = useIsMobile();

  return (
    <div 
      className="flex items-center justify-between p-5 bg-white rounded-[12px] border border-[#BEB8AE] hover:shadow-md transition-all group cursor-pointer shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {!isMobile && (
          <div className="text-gray-600 flex-shrink-0">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="text-left">
          <h3 className="text-lg font-semibold font-['Inter'] text-gray-900">{title}</h3>
          {description && <p className="text-sm font-['Inter'] text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="bg-[#245C4F] hover:bg-[#1e4f44] p-3 rounded-[10px] transition-colors flex items-center justify-center ml-2 flex-shrink-0 shadow-[0_3px_0_0_#1a453e]">
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <ArrowRight className="w-5 h-5 text-white" />
        )}
      </div>
    </div>
  );
};

export default SimulazioneAvanzata;
