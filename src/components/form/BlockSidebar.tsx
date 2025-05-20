
import React, { useMemo } from "react";
import { useForm } from "@/contexts/FormContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";

export function BlockSidebar() {
  const { blocks, state, isBlockCompleted } = useForm();
  const params = useParams<{ blockType?: string }>();
  
  // Utilizziamo useMemo per evitare calcoli ripetuti ad ogni render
  const activeBlocks = useMemo(() => {
    return blocks
      .filter(block => state.activeBlocks.includes(block.block_id) && !block.invisible)
      .sort((a, b) => a.priority - b.priority);
  }, [blocks, state.activeBlocks]);

  const isBlockActive = (blockId: string) => {
    return state.activeQuestion.block_id === blockId;
  };

  const getBlockStatus = (blockId: string) => {
    // Usa completedBlocks per ottimizzare - è la fonte primaria di verità
    if (isBlockCompleted(blockId)) return "completato";
    if (isBlockActive(blockId)) return "attivo";
    
    // Solo se non completato, verifica se alcune domande sono risposte
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
