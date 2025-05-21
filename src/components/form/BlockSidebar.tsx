
import { useFormExtended } from "@/hooks/useFormExtended";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { CircleCheck, Hand } from "lucide-react";

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
                  "w-full text-left flex items-center py-2 px-3 rounded-md transition-all",
                  {
                    // Active block styling
                    "bg-[#245C4F] text-white font-medium": isActive,
                    
                    // Completed block styling (dark green with low transparency)
                    "bg-[#245C4F]/20 text-gray-700": isCompleted && !isActive,
                    
                    // First non-completed block styling
                    "bg-[#245C4F]/10 text-gray-700": isFirstNonCompleted && !isActive && !isCompleted,
                    
                    // Default text color
                    "text-gray-700": !isActive && !isCompleted && !isFirstNonCompleted,
                    
                    // Clickable styling
                    "cursor-pointer hover:bg-opacity-90": isClickable,
                    "cursor-default opacity-70": !isClickable
                  }
                )}
                onClick={() => isClickable ? handleBlockClick(block.block_id) : null}
              >
                <div className="truncate text-sm flex-1">{block.title}</div>
                
                {/* Completed block icon - CircleCheck */}
                {isCompleted && !isActive && (
                  <div className="ml-2 flex-shrink-0 text-[#245C4F] flex items-center justify-center">
                    <CircleCheck size={18} className="text-[#245C4F] font-bold" />
                  </div>
                )}
                
                {/* First non-completed block icon - Hand */}
                {isFirstNonCompleted && !isCompleted && !isActive && (
                  <div className="ml-2 flex-shrink-0 text-[#245C4F] flex items-center justify-center">
                    <Hand size={18} className="text-[#245C4F]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
