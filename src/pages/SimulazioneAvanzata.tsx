
import React, { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge as UIBadge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { formCacheService } from "@/services/formCacheService";
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
  
  // Funzione per gestire l'avvio della simulazione mutuo
  const startMortgageSimulation = async () => {
    setLoading(true);
    
    try {
      // Track simulation start
      trackSimulationStart('Simulazione Mutuo');
      
      // Track custom exit since user is navigating to simulation
      trackCustomExit('simulation_start');
      
      // Get cached form blocks for simulazione-mutuo
      const cachedForm = await formCacheService.getForm('simulazione-mutuo');
      
      if (!cachedForm || !cachedForm.blocks || cachedForm.blocks.length === 0) {
        console.warn('⚠️ Cached form not found, using fallback blocks');
        toast.error("Errore nel caricamento del form. Riprova più tardi.");
        setLoading(false);
        return;
      }
      
      // Clear any existing form state
      localStorage.removeItem('form-state-simulazione-mutuo');
      
      // Find all blocks that are active by default from cached blocks
      const defaultActiveBlocks = cachedForm.blocks
        .filter(block => block.default_active)
        .map(block => block.block_id);
      
      // Find the first block to start with
      const firstBlock = cachedForm.blocks[0];
      const firstQuestion = firstBlock?.questions?.[0];
      
      if (!firstBlock || !firstQuestion) {
        console.error('❌ No valid starting point found in cached blocks');
        toast.error("Errore nella configurazione del form.");
        setLoading(false);
        return;
      }
      
      // Create initial state with cached blocks structure
      const initialState = {
        activeBlocks: defaultActiveBlocks,
        activeQuestion: {
          block_id: firstBlock.block_id,
          question_id: firstQuestion.question_id
        },
        responses: {},
        answeredQuestions: []
      };
      
      // Save initial state
      localStorage.setItem('form-state-simulazione-mutuo', JSON.stringify(initialState));
      
      // Navigate to the form with the simulazione-mutuo slug
      navigate(`/simulazione/simulazione-mutuo/${firstBlock.block_id}/${firstQuestion.question_id}`);
      
    } catch (error) {
      console.error('❌ Error starting mortgage simulation:', error);
      toast.error("Errore nell'avvio della simulazione. Riprova più tardi.");
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
          {/* Single Simulazione Mutuo option */}
          <OptionCard
            icon={Calculator}
            title="Simulazione Mutuo"
            description="Calcola il tuo mutuo ideale con la nostra simulazione avanzata"
            onClick={startMortgageSimulation}
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

// Componente per l'opzione singola
interface OptionCardProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  onClick?: () => void;
  loading?: boolean;
}

const OptionCard = ({ icon: Icon, title, description, onClick, loading = false }: OptionCardProps) => {
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    if (!loading && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-5 bg-white rounded-[12px] border border-[#BEB8AE] ${
        loading 
          ? "opacity-80 cursor-not-allowed" 
          : "hover:shadow-md transition-all group cursor-pointer shadow-[0_3px_0_0_#AFA89F] hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {!isMobile && (
          <div className={`text-gray-600 flex-shrink-0 ${loading ? "opacity-60" : ""}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="text-left">
          <h3 className={`text-lg font-semibold font-['Inter'] ${loading ? "text-gray-600" : "text-gray-900"}`}>{title}</h3>
          {description && <p className={`text-sm font-['Inter'] ${loading ? "text-gray-500" : "text-gray-500"} mt-0.5`}>{description}</p>}
        </div>
      </div>
      <div className={`${loading ? "bg-gray-300" : "bg-[#245C4F] hover:bg-[#1e4f44]"} p-3 rounded-[10px] transition-colors flex items-center justify-center ml-2 flex-shrink-0 shadow-[0_3px_0_0_#1a453e]`}>
        <ArrowRight className={`w-5 h-5 ${loading ? "text-gray-100" : "text-white"}`} />
      </div>
    </div>
  );
};

export default SimulazioneAvanzata;
