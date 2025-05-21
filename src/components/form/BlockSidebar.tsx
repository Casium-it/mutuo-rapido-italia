
import { useFormExtended } from "@/hooks/useFormExtended";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { CircleCheck, ChevronRight, AlertCircle } from "lucide-react";

export function BlockSidebar() {
  const { blocks, state, isBlockCompleted, goToQuestion } = useFormExtended();
  const params = useParams<{ blockType?: string }>();
  
  // Filter blocks that are active and not invisible, and sort by priority
  const activeBlocks = blocks
    .filter(block => state.activeBlocks.includes(block.block_id) && !block.invisible)
    .sort((a, b) => a.priority - b.priority); // Ordinamento per priorità

  const isBlockActive = (blockId: string) => {
    return state.activeQuestion.block_id === blockId;
  };
  
  const handleBlockClick = (blockId: string) => {
    // Solo i blocchi completati o il primo blocco non completato sono cliccabili
    const isCompleted = isBlockCompleted(blockId);
    const isCurrentBlock = isBlockActive(blockId);
    const isFirstNonCompleted = blockId === activeBlocks.find(
      block => !isBlockCompleted(block.block_id)
    )?.block_id;
    
    if (isCompleted || isCurrentBlock || isFirstNonCompleted) {
      const block = blocks.find(b => b.block_id === blockId);
      if (block && block.questions.length > 0) {
        goToQuestion(blockId, block.questions[0].question_id);
      }
    }
  };
  
  // Trova l'indice del primo blocco non completato
  const firstNonCompletedIndex = activeBlocks.findIndex(
    block => !isBlockCompleted(block.block_id)
  );

  return (
    <div className="w-full bg-[#FAF9F6] h-full py-6 overflow-y-auto border-r border-gray-200">
      <div className="px-4">
        <h2 className="text-base font-semibold text-gray-800 mb-6">Il tuo percorso</h2>
        <div className="space-y-1">
          {activeBlocks.map((block, index) => {
            const isActive = isBlockActive(block.block_id);
            const isCompleted = isBlockCompleted(block.block_id);
            const isFirstNonCompleted = index === firstNonCompletedIndex;
            const isClickable = isCompleted || isFirstNonCompleted;
            
            return (
              <div
                key={block.block_id}
                className={cn(
                  "w-full text-left flex items-center gap-2 py-2 px-3 rounded-md transition-all duration-300 ease-in-out",
                  {
                    // Active block styling - increased transition duration
                    "bg-[#245C4F] text-white font-medium": isActive,
                    
                    // Completed block styling - increased transition duration and smoother color
                    "bg-[#245C4F]/20 text-gray-700 hover:bg-[#245C4F]/30": isCompleted && !isActive,
                    
                    // First non-completed block styling - increased transition duration
                    "bg-[#E8E2D7] text-gray-700": isFirstNonCompleted && !isActive && !isCompleted,
                    
                    // Default text color with transition
                    "text-gray-700": !isActive && !isCompleted && !isFirstNonCompleted,
                    
                    // Clickable styling with smoother hover transition
                    "cursor-pointer hover:bg-opacity-90": isClickable,
                    "cursor-default opacity-70": !isClickable
                  }
                )}
                onClick={() => isClickable ? handleBlockClick(block.block_id) : null}
              >
                <div className="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center transition-all duration-300 ease-in-out">
                  {/* Completed block icon - CircleCheck with transition */}
                  {isCompleted && !isActive && (
                    <CircleCheck size={18} className="text-[#245C4F] font-bold transition-all duration-300 ease-in-out" />
                  )}
                  
                  {/* First non-completed block icon - AlertCircle with transition */}
                  {isFirstNonCompleted && !isCompleted && !isActive && (
                    <AlertCircle size={18} className="text-red-600 transition-all duration-300 ease-in-out" />
                  )}
                  
                  {/* Current block icon - ChevronRight with transition */}
                  {isActive && (
                    <ChevronRight size={18} className="text-white transition-all duration-300 ease-in-out" />
                  )}
                </div>
                
                <div className="truncate text-sm flex-1 transition-all duration-300 ease-in-out">{block.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
