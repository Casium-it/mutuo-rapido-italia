
import { useForm } from "@/contexts/FormContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { StandardBlock, RepeatingGroupBlock } from "@/types/form";

export function BlockSidebar() {
  const { blocks, state } = useForm();
  const params = useParams<{ blockType?: string }>();
  
  // Filter blocks that are active and sort by priority
  const activeBlocks = blocks
    .filter(block => state.activeBlocks.includes(block.block_id))
    .sort((a, b) => a.priority - b.priority); // Ordinamento per priorità

  const isBlockActive = (blockId: string) => {
    return state.activeQuestion.block_id === blockId;
  };

  const isBlockCompleted = (blockId: string) => {
    const block = blocks.find(b => b.block_id === blockId);
    if (!block) return false;

    // Gestisci sia i blocchi standard che i repeating_group
    if ('type' in block && block.type === 'repeating_group') {
      // Per repeating_group, considera completato se c'è almeno un elemento nel gruppo
      const repeatingGroupEntries = state.repeatingGroups?.[block.repeating_id] || [];
      return repeatingGroupEntries.length > 0;
    } else {
      // Per blocchi standard, considera completato se tutte le domande sono state risposto
      const standardBlock = block as StandardBlock;
      return standardBlock.questions.every(question => state.answeredQuestions.has(question.question_id));
    }
  };

  const getBlockStatus = (blockId: string) => {
    if (isBlockCompleted(blockId)) return "completato";
    if (isBlockActive(blockId)) return "attivo";
    
    // Se c'è almeno una domanda risposta ma non tutte (solo per blocchi standard)
    const block = blocks.find(b => b.block_id === blockId);
    if (block) {
      if ('type' in block && block.type === 'repeating_group') {
        return "non iniziato"; // Per repeating_group, non c'è stato "parziale"
      } else {
        const standardBlock = block as StandardBlock;
        const hasAnyAnswer = standardBlock.questions.some(q => state.answeredQuestions.has(q.question_id));
        if (hasAnyAnswer) return "parziale";
      }
    }
    
    return "non iniziato";
  };

  return (
    <div className="w-full bg-[#FAF9F6] h-full py-6 overflow-y-auto border-r border-gray-200">
      <div className="px-4">
        <h2 className="text-base font-semibold text-gray-800 mb-6">Il tuo percorso</h2>
        <div className="space-y-1">
          {activeBlocks.map((block) => {
            const status = getBlockStatus(block.block_id);
            return (
              <div
                key={block.block_id}
                className={cn(
                  "w-full text-left flex items-center py-2 px-3 rounded-md transition-all cursor-default",
                  {
                    "bg-black text-white font-medium": status === "attivo",
                    "bg-gray-100 text-gray-800 font-medium": status === "completato",
                    "bg-gray-50 text-gray-700": status === "parziale", 
                    "text-gray-700": status === "non iniziato"
                  }
                )}
              >
                <div className="mr-2 shrink-0">
                  {status === "completato" && <Check className="w-4 h-4 text-black" />}
                </div>
                <div className="truncate text-sm">{block.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
