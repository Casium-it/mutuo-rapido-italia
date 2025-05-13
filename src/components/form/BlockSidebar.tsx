
import { useForm } from "@/contexts/FormContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";

export function BlockSidebar() {
  const { blocks, state, goToQuestion } = useForm();
  const params = useParams<{ blockType?: string }>();
  
  // Filter blocks that are active
  const activeBlocks = blocks.filter(block => state.activeBlocks.includes(block.block_id));

  const navigateToBlock = (blockId: string) => {
    const block = blocks.find(b => b.block_id === blockId);
    if (block && block.questions.length > 0) {
      goToQuestion(blockId, block.questions[0].question_id);
    }
  };

  const isBlockActive = (blockId: string) => {
    return state.activeQuestion.block_id === blockId;
  };

  const isBlockCompleted = (blockId: string) => {
    const block = blocks.find(b => b.block_id === blockId);
    if (!block) return false;

    return block.questions.every(question => state.answeredQuestions.has(question.question_id));
  };

  const getBlockStatus = (blockId: string) => {
    if (isBlockCompleted(blockId)) return "completato";
    if (isBlockActive(blockId)) return "attivo";
    
    // Se c'è almeno una domanda risposta ma non tutte
    const block = blocks.find(b => b.block_id === blockId);
    if (block) {
      const hasAnyAnswer = block.questions.some(q => state.answeredQuestions.has(q.question_id));
      if (hasAnyAnswer) return "parziale";
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
              <button
                key={block.block_id}
                onClick={() => navigateToBlock(block.block_id)}
                className={cn(
                  "w-full text-left flex items-center py-2 px-3 rounded-md transition-all",
                  {
                    "bg-black text-white font-medium": status === "attivo",
                    "bg-gray-100 text-gray-800 font-medium": status === "completato",
                    "bg-gray-50 text-gray-700": status === "parziale",
                    "text-gray-700 hover:bg-gray-100": status === "non iniziato"
                  }
                )}
              >
                <div className="mr-2 shrink-0">
                  {status === "completato" && <Check className="w-4 h-4 text-black" />}
                </div>
                <div className="truncate text-sm">{block.title}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
