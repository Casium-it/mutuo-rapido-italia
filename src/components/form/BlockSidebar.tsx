import { useFormExtended } from "@/hooks/useFormExtended";
import { cn } from "@/lib/utils";
import { useParams, Link } from "react-router-dom";
import { CircleCheck, ChevronRight, Lock, ArrowLeft } from "lucide-react";
import { CompleteFormButton } from "./CompleteFormButton"; 
import { useState } from "react";
import { ExitConfirmationDialog } from "./ExitConfirmationDialog";
import { SaveSimulationDialog } from "./SaveSimulationDialog";
import { useNavigate } from "react-router-dom";
import { saveSimulation, SaveSimulationData } from "@/services/saveSimulationService";
import { toast } from "sonner";
import { useSimulationTimer } from "@/hooks/useSimulationTimer";
import { trackSimulationExit } from "@/utils/analytics";

export function BlockSidebar() {
  const {
    blocks,
    state,
    isBlockCompleted,
    goToQuestion,
    getProgress
  } = useFormExtended();
  const params = useParams<{
    blockType?: string;
  }>();
  const navigate = useNavigate();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get global simulation timer for exit purposes
  const { getTotalTimeSpent } = useSimulationTimer();

  // Filter blocks that are active and not invisible, and sort by priority
  const activeBlocks = blocks.filter(block => state.activeBlocks.includes(block.block_id) && !block.invisible).sort((a, b) => a.priority - b.priority);

  const isBlockActive = (blockId: string) => {
    return state.activeQuestion.block_id === blockId;
  };

  const handleBlockClick = (blockId: string) => {
    // Solo i blocchi completati o il primo blocco non completato sono cliccabili
    const isCompleted = isBlockCompleted(blockId);
    const isCurrentBlock = isBlockActive(blockId);
    const isFirstNonCompleted = blockId === activeBlocks.find(block => !isBlockCompleted(block.block_id))?.block_id;
    if (isCompleted || isCurrentBlock || isFirstNonCompleted) {
      const block = blocks.find(b => b.block_id === blockId);
      if (block && block.questions.length > 0) {
        goToQuestion(blockId, block.questions[0].question_id);
      }
    }
  };

  // Handle back button click with confirmation
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Handle saving simulation
  const handleSaveSimulation = async (contactData: SaveSimulationData) => {
    setIsSaving(true);
    
    try {
      const formType = params.blockType || "unknown";
      const result = await saveSimulation(state, contactData, formType);
      
      setIsSaving(false);
      return result;
    } catch (error) {
      setIsSaving(false);
      console.error('Errore nel salvataggio:', error);
      return { 
        success: false, 
        error: "Errore imprevisto durante il salvataggio" 
      };
    }
  };

  // Handle close save dialog
  const handleCloseSaveDialog = (shouldNavigate: boolean = false) => {
    setShowSaveDialog(false);
    if (shouldNavigate) {
      navigate("/");
    }
  };

  // Trova l'indice del primo blocco non completato
  const firstNonCompletedIndex = activeBlocks.findIndex(block => !isBlockCompleted(block.block_id));
  
  // Check if all blocks are completed
  const areAllBlocksCompleted = state.activeBlocks?.every(
    blockId => state.completedBlocks?.includes(blockId)
  );

  // Calculate progress
  const progress = getProgress();

  return (
    <>
      <div className="w-full bg-[#FAF9F6] h-full py-6 overflow-y-auto border-r border-gray-200 px-[16px] flex flex-col">
        <div className="px-4 flex-1">
          <div className="flex items-center mb-6">
            <button 
              onClick={handleBackClick}
              className="mr-3 text-gray-700 hover:text-[#245C4F] transition-all duration-200"
            >
              <ArrowLeft 
                size={20} 
                className="transform transition-transform duration-200 hover:scale-125" 
                aria-label="Torna alla home"
              />
            </button>
            <h2 className="text-base font-semibold text-gray-800">Il tuo percorso</h2>
          </div>
          
          <div className="space-y-1">
            {activeBlocks.map((block, index) => {
            const isActive = isBlockActive(block.block_id);
            const isCompleted = isBlockCompleted(block.block_id);
            const isFirstNonCompleted = index === firstNonCompletedIndex;
            const isClickable = isCompleted || isFirstNonCompleted;
            const isLocked = !isClickable && !isActive;
            return <div key={block.block_id} className={cn("w-full text-left flex items-center gap-2 py-2 px-3 rounded-md transition-all", {
              // Active block styling
              "bg-[#245C4F] text-white font-medium": isActive,
              // Completed block styling (dark green with low transparency)
              "bg-[#245C4F]/20 text-gray-700 hover:bg-[#245C4F]/40": isCompleted && !isActive,
              // First non-completed block styling (dark green with very high transparency)
              "bg-[#245C4F]/10 text-gray-700": isFirstNonCompleted && !isActive && !isCompleted,
              // Default text color
              "text-gray-700": !isActive && !isCompleted && !isFirstNonCompleted,
              // Clickable styling
              "cursor-pointer hover:bg-opacity-90": isClickable,
              "cursor-default opacity-70": !isClickable
            })} onClick={() => isClickable ? handleBlockClick(block.block_id) : null}>
                  {/* Completed block icon - CircleCheck */}
                  {isCompleted && !isActive && <div className="flex-shrink-0 text-[#245C4F] flex items-center justify-center group-hover:text-[#1b4a3e] transition-colors">
                      <CircleCheck size={18} className="text-[#245C4F] font-bold hover:text-[#1b4a3e] transition-colors" />
                    </div>}
                  
                  {/* Current block icon - ChevronRight */}
                  {isActive && <div className="flex-shrink-0 text-white flex items-center justify-center">
                      <ChevronRight size={18} className="text-white" />
                    </div>}
                  
                  {/* Lock icon for non-clickable and non-active blocks */}
                  {isLocked && <div className="flex-shrink-0 flex items-center justify-center">
                      <Lock size={16} className="text-gray-700" />
                    </div>}
                  
                  <div className="truncate text-sm flex-1">{block.title}</div>
                </div>;
          })}
          </div>
        </div>

        {/* Complete Form button - displayed at bottom when all blocks are completed */}
        {areAllBlocksCompleted && (
          <div className="px-4 mt-6 mb-2">
            <CompleteFormButton />
          </div>
        )}
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
        onClose={() => handleCloseSaveDialog(false)}
        onSave={handleSaveSimulation}
        isLoading={isSaving}
      />
    </>
  );
}
