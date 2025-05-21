
import { useFormExtended } from "@/hooks/useFormExtended";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export function BlockSidebar() {
  const { blocks, state, isBlockCompleted, goToQuestion } = useFormExtended();
  const navigate = useNavigate();
  
  // Filter blocks that are active and not invisible, and sort by priority
  const activeBlocks = blocks
    .filter(block => state.activeBlocks.includes(block.block_id) && !block.invisible)
    .sort((a, b) => a.priority - b.priority);

  const isBlockActive = (blockId: string) => {
    return state.activeQuestion.block_id === blockId;
  };

  // Trova il primo blocco attivo non completato
  const findFirstNonCompletedBlock = () => {
    return activeBlocks.find(block => !isBlockCompleted(block.block_id))?.block_id || null;
  };
  
  // Trova la prima domanda di un blocco
  const getFirstQuestionOfBlock = (blockId: string) => {
    const block = blocks.find(b => b.block_id === blockId);
    return block?.questions[0]?.question_id;
  };
  
  // Controlla se un blocco è il primo blocco attivo non completato
  const isFirstNonCompletedBlock = (blockId: string) => {
    const firstNonCompletedBlockId = findFirstNonCompletedBlock();
    return firstNonCompletedBlockId === blockId && !isBlockCompleted(blockId);
  };
  
  // Controlla se un blocco è navigabile (completato o primo non completato)
  const isBlockNavigable = (blockId: string) => {
    return isBlockCompleted(blockId) || isFirstNonCompletedBlock(blockId);
  };
  
  // Gestisce il click su un blocco
  const handleBlockClick = (blockId: string) => {
    if (!isBlockNavigable(blockId)) return; // Non fare nulla se non è navigabile
    
    const firstQuestionId = getFirstQuestionOfBlock(blockId);
    if (firstQuestionId) {
      // Naviga alla prima domanda del blocco
      goToQuestion(blockId, firstQuestionId);
      
      // Aggiorna anche l'URL per rispecchiare la navigazione
      navigate(`/simulazione/pensando/${blockId}/${firstQuestionId}`);
    }
  };

  return (
    <div className="w-full bg-[#FAF9F6] h-full py-6 overflow-y-auto border-r border-gray-200">
      <div className="px-4">
        <h2 className="text-base font-semibold text-gray-800 mb-6">Il tuo percorso</h2>
        <div className="space-y-1">
          {activeBlocks.map((block) => {
            const isActive = isBlockActive(block.block_id);
            const isCompleted = isBlockCompleted(block.block_id);
            const isFirstNonCompleted = isFirstNonCompletedBlock(block.block_id);
            const canNavigate = isBlockNavigable(block.block_id);
            
            return (
              <div
                key={block.block_id}
                className={cn(
                  "w-full text-left flex items-center py-2 px-3 rounded-md transition-all",
                  {
                    "bg-[#245C4F] text-white font-medium": isActive,
                    "bg-[#245C4F]/20 text-gray-700 hover:bg-[#245C4F]/30": isCompleted && !isActive,
                    "bg-[#245C4F]/10 text-gray-700 hover:bg-[#245C4F]/15": isFirstNonCompleted && !isActive,
                    "text-gray-700": !isActive && !isCompleted && !isFirstNonCompleted,
                    "cursor-pointer": canNavigate,
                    "cursor-default": !canNavigate
                  }
                )}
                onClick={() => handleBlockClick(block.block_id)}
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
