
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
            
            // Modificato: Un blocco non può essere sia attivo che il primo non completato
            // Se un blocco è attivo, non dovrebbe essere considerato come primo non completato
            const isFirstNonCompleted = index === firstNonCompletedIndex && !isActive;
            
            const isClickable = isCompleted || isActive || isFirstNonCompleted;
            
            return (
              <div
                key={block.block_id}
                className={cn(
                  "w-full text-left flex items-center gap-2 py-2 px-3 rounded-md transition-all",
                  {
                    // Active block styling
                    "bg-[#245C4F] text-white font-medium": isActive,
                    
                    // Completed block styling (dark green with low transparency)
                    "bg-[#245C4F]/20 text-gray-700 hover:bg-[#245C4F]/30": isCompleted && !isActive,
                    
                    // First non-completed block styling (darker beige) with 1s delay
                    "bg-[#E8E2D7] text-gray-700 transition-all delay-[1000ms]": isFirstNonCompleted && !isCompleted,
                    
                    // Default text color
                    "text-gray-700": !isActive && !isCompleted && !isFirstNonCompleted,
                    
                    // Clickable styling
                    "cursor-pointer hover:bg-opacity-90": isClickable,
                    "cursor-default opacity-70": !isClickable
                  }
                )}
                onClick={() => isClickable ? handleBlockClick(block.block_id) : null}
              >
                {/* Completed block icon - CircleCheck (spostato a sinistra) */}
                {isCompleted && !isActive && (
                  <div className="flex-shrink-0 text-[#245C4F] flex items-center justify-center group-hover:text-[#1b4a3e] transition-colors">
                    <CircleCheck size={18} className="text-[#245C4F] font-bold hover:text-[#1b4a3e] transition-colors" />
                  </div>
                )}
                
                {/* First non-completed block icon - AlertCircle (dark red instead of Pencil) with 1s delay */}
                {isFirstNonCompleted && !isCompleted && (
                  <div className="flex-shrink-0 flex items-center justify-center transition-all delay-[1000ms]">
                    <AlertCircle size={18} className="text-red-600 transition-all delay-[1000ms]" />
                  </div>
                )}
                
                {/* Current block icon - ChevronRight (aggiunto a sinistra) */}
                {isActive && (
                  <div className="flex-shrink-0 text-white flex items-center justify-center">
                    <ChevronRight size={18} className="text-white" />
                  </div>
                )}
                
                <div className="truncate text-sm flex-1">{block.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
