
import { useFormExtended } from "@/hooks/useFormExtended";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { Check } from "lucide-react";

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
  
  // Per determinare se un blocco è navigabile
  const isBlockNavigable = (blockId: string) => {
    // Se è il blocco attuale o è già completato, è navigabile
    if (isBlockActive(blockId) || isBlockCompleted(blockId)) {
      return true;
    }
    
    // Troviamo l'indice del blocco corrente
    const currentBlockIndex = activeBlocks.findIndex(
      block => block.block_id === state.activeQuestion.block_id
    );
    
    // Troviamo l'indice del blocco di destinazione
    const targetBlockIndex = activeBlocks.findIndex(
      block => block.block_id === blockId
    );
    
    // È navigabile se è il prossimo blocco non completato
    if (targetBlockIndex > currentBlockIndex) {
      // Verifichiamo che tutti i blocchi tra i due siano completati
      for (let i = currentBlockIndex + 1; i < targetBlockIndex; i++) {
        if (!isBlockCompleted(activeBlocks[i].block_id)) {
          return false;
        }
      }
      return true;
    }
    
    return false;
  };
  
  // Per trovare il primo blocco non completato da mostrare come successivo
  const findFirstNonCompletedBlock = () => {
    for (const block of activeBlocks) {
      if (!isBlockCompleted(block.block_id) && !isBlockActive(block.block_id)) {
        return block;
      }
    }
    return null;
  };
  
  const handleBlockClick = (blockId: string) => {
    const block = blocks.find(b => b.block_id === blockId);
    if (!block || block.questions.length === 0) return;
    
    // Naviga alla prima domanda del blocco
    goToQuestion(blockId, block.questions[0].question_id);
  };
  
  const firstNonCompletedBlock = findFirstNonCompletedBlock();

  return (
    <div className="w-full bg-[#FAF9F6] h-full py-6 overflow-y-auto border-r border-gray-200">
      <div className="px-4">
        <h2 className="text-base font-semibold text-gray-800 mb-6">Il tuo percorso</h2>
        <div className="space-y-1">
          {activeBlocks.map((block) => {
            const isActive = isBlockActive(block.block_id);
            const isCompleted = isBlockCompleted(block.block_id);
            const isNavigable = isBlockNavigable(block.block_id);
            const isNextBlock = firstNonCompletedBlock?.block_id === block.block_id;
            
            return (
              <div
                key={block.block_id}
                className={cn(
                  "w-full text-left flex items-center py-2 px-3 rounded-md transition-all",
                  {
                    "bg-[#245C4F] text-white font-medium": isActive,
                    "bg-[#245C4F]/20 text-gray-700 hover:bg-[#245C4F]/30 cursor-pointer": isCompleted && !isActive, 
                    "bg-[#245C4F]/10 text-gray-700 hover:bg-[#245C4F]/15 cursor-pointer": isNextBlock && !isActive && !isCompleted,
                    "text-gray-700": !isActive && !isCompleted && !isNextBlock,
                    "cursor-pointer": isNavigable,
                    "cursor-default": !isNavigable
                  }
                )}
                onClick={() => {
                  if (isNavigable || isCompleted) {
                    handleBlockClick(block.block_id);
                  }
                }}
              >
                <div className="truncate text-sm flex-1">{block.title}</div>
                {isCompleted && !isActive && (
                  <Check size={16} className="text-[#245C4F] ml-2 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
