
import { useForm } from "@/contexts/FormContext";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";

export function BlockSidebar() {
  const { blocks, state } = useForm();
  const params = useParams<{ blockType?: string }>();
  
  // Filter blocks that are active, not invisible, and sort by priority
  const activeBlocks = blocks
    .filter(block => state.activeBlocks.includes(block.block_id) && !block.invisible)
    .sort((a, b) => a.priority - b.priority); // Ordinamento per priorità

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

  // Funzione per renderizzare il cerchio di stato appropriato
  const renderStatusCircle = (status: string) => {
    switch (status) {
      case "completato":
        // Cerchio pieno verde
        return (
          <div className="w-5 h-5 rounded-full bg-[#245C4F] flex items-center justify-center" />
        );
      case "parziale":
        // Cerchio mezzo pieno
        return (
          <div className="w-5 h-5 rounded-full border-2 border-[#BEB8AE] relative">
            <div className="absolute inset-0 bg-[#245C4F] rounded-full clip-half" />
          </div>
        );
      case "attivo":
        // Cerchio con bordo più spesso per l'elemento attivo
        return (
          <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center" />
        );
      default:
        // Cerchio vuoto (beige)
        return (
          <div className="w-5 h-5 rounded-full border-2 border-[#BEB8AE] flex items-center justify-center" />
        );
    }
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
                  {renderStatusCircle(status)}
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
