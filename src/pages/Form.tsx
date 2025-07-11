
import React, { useEffect, useState } from "react";
import { useForm } from "@/contexts/FormContext";
import { BlockSidebar } from "@/components/form/BlockSidebar";
import { QuestionView } from "@/components/form/QuestionView";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SaveSimulationDialog } from "@/components/form/SaveSimulationDialog";
import { ExitConfirmationDialog } from "@/components/form/ExitConfirmationDialog";
import { saveSimulation, SaveSimulationData } from "@/services/saveSimulationService";
import { toast } from "sonner";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { useSimulationTimer } from "@/hooks/useSimulationTimer";
import { trackSimulationExit } from "@/utils/analytics";

export default function Form() {
  const form = useForm();
  const {
    state,
    blocks,
    getProgress,
    resetForm,
    goToQuestion
  } = form;
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize time tracking for the simulation
  const { getTimeSpent, trackCustomExit } = useTimeTracking({
    pageName: 'simulation_form'
  });

  // Initialize global simulation timer
  const { initializeTimer, getTotalTimeSpent } = useSimulationTimer();

  // Initialize global timer when form component mounts
  useEffect(() => {
    initializeTimer();
  }, [initializeTimer]);

  // Trova il blocco attivo corrente
  const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);

  // Calcola il progresso del form
  const progress = getProgress();

  // Check if all active blocks are completed
  const areAllBlocksCompleted = state.activeBlocks?.every(
    blockId => state.completedBlocks?.includes(blockId)
  );

  // Handle logo click with confirmation - prevent default navigation
  const handleLogoClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowExitDialog(true);
  };

  // Handle confirmed exit without saving - NOW WITH GLOBAL TRACKING
  const handleConfirmExit = () => {
    const totalTimeSpent = getTotalTimeSpent();
    trackSimulationExit('confirmed_exit', totalTimeSpent);
    setShowExitDialog(false);
    navigate("/");
  };

  // Handle exit with save option
  const handleExitWithSave = () => {
    setShowExitDialog(false);
    setShowSaveDialog(true);
  };

  // Use form context save function
  const handleSaveSimulation = async (contactData: SaveSimulationData) => {
    setIsSaving(true);
    
    try {
      const result = await form.handleSaveSimulation(contactData);
      setIsSaving(false);
      return result;
    } catch (error) {
      console.error("Error saving simulation:", error);
      setIsSaving(false);
      return {
        success: false,
        error: "Errore durante il salvataggio della simulazione"
      };
    }
  };

  // Gestisci il salvataggio e l'uscita
  const handleSaveAndExit = () => {
    setShowSaveDialog(true);
  };

  // Gestisci la chiusura del dialog di salvataggio - FIXED: only navigate on successful save
  const handleCloseSaveDialog = (shouldNavigate: boolean = false) => {
    setShowSaveDialog(false);
    // Only navigate to home page if shouldNavigate is true (successful save)
    if (shouldNavigate) {
      navigate("/");
    }
  };

  // Handle successful save and exit
  const handleSaveSuccess = () => {
    handleCloseSaveDialog(true); // Navigate to home on successful save
  };

  // Track tab close/page unload as simulation exit - WITH GLOBAL TRACKING
  useEffect(() => {
    const handleBeforeUnload = () => {
      const totalTimeSpent = getTotalTimeSpent();
      trackSimulationExit('tab_close', totalTimeSpent);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [getTotalTimeSpent]);

  // Assicuriamoci che il componente si ri-renderizzi quando cambia l'URL
  useEffect(() => {
    // Questo effetto verrà eseguito ogni volta che cambia l'URL (location.pathname)
    // Poiché dipende da location.pathname, forza un ri-rendering del componente
  }, [location.pathname]);
  
  return <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="py-3 px-4 md:px-6 flex justify-between items-center bg-white border-b border-gray-200">
        <div className="flex items-center">
          <Logo onClick={handleLogoClick} />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-100 text-sm" onClick={handleSaveAndExit}>
            Salva ed esci
          </Button>
        </div>
      </header>

      {/* Progress bar - With increased top padding (py-3 on desktop) and mobile sidebar on the right */}
      <div className="bg-white px-4 py-2 md:py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Progress value={progress} className="h-1 bg-gray-100 rounded-full" indicatorClassName="bg-black" />
          <span className="text-xs font-medium text-gray-500">{progress}%</span>
          
          {/* Mobile sidebar trigger - moved to the right */}
          {isMobile && <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto hover:bg-[#F0EAE0]">
                  <Menu size={20} className="text-gray-700" />
                  <span className="sr-only">Apri navigazione</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <div className="h-full bg-[#FAF9F6] p-4 py-0 px-0">
                  <BlockSidebar />
                </div>
              </SheetContent>
            </Sheet>}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - increased width from 240px to 280px */}
        <div className="hidden md:block w-[280px] bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 h-full py-0 px-0">
            <BlockSidebar />
          </div>
        </div>

        {/* Content area - con key basata sul pathname per forzare il re-rendering */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-2xl mx-auto">
            {/* Block title */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{activeBlock?.title}</h1>
            </div>

            {/* Question - con key per forzare il re-rendering quando cambia l'URL */}
            <div key={location.pathname}>
              <QuestionView />
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <ExitConfirmationDialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirmExit={handleConfirmExit}
        onSaveAndExit={handleExitWithSave}
        progress={progress}
      />

      {/* Save Simulation Dialog */}
      <SaveSimulationDialog 
        open={showSaveDialog}
        onClose={() => handleCloseSaveDialog(false)} // Don't navigate on cancel/close
        onSave={handleSaveSimulation}
        isLoading={isSaving}
      />
    </div>;
}
