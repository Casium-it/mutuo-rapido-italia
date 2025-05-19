
import { useForm } from "@/contexts/FormContext";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";

export function BlockSidebar() {
  const { blocks, state } = useForm();
  const params = useParams<{ blockType?: string }>();
  
  // Filter blocks that are active, not invisible, and sort by priority
  const activeBlocks = blocks
    .filter(block => state.activeBlocks.includes(block.block_id) && !block.invisible)
    .sort((a, b) => a.priority - b.priority);

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

  // Determina se un blocco viene prima o dopo il blocco attivo
  const getBlockPosition = (blockId: string) => {
    const activeBlockIndex = activeBlocks.findIndex(b => b.block_id === state.activeQuestion.block_id);
    const blockIndex = activeBlocks.findIndex(b => b.block_id === blockId);
    
    if (blockIndex < activeBlockIndex) return "prima";
    if (blockIndex === activeBlockIndex) return "corrente";
    return "dopo";
  };

  return (
    <div className="w-full bg-white h-full py-6 overflow-y-auto">
      <div className="px-4">
        <h2 className="text-base font-semibold text-gray-800 mb-6">Il tuo percorso</h2>
        <div className="space-y-0 relative">
          {/* Linea verticale di connessione */}
          <div className="absolute left-[10px] top-5 bottom-5 w-0.5 z-0">
            {activeBlocks.map((block, index) => {
              const position = getBlockPosition(block.block_id);
              const isLastBlock = index === activeBlocks.length - 1;
              const height = isLastBlock ? "h-0" : "h-full";
              
              // Se il blocco è prima o è il blocco corrente, la linea sopra è verde
              // Se il blocco è dopo il blocco corrente, la linea sopra è grigia
              const colorClass = position === "dopo" ? "bg-[#b0ada7]" : "bg-[#007d65]";
              
              return (
                <div 
                  key={`line-${block.block_id}`} 
                  className={`absolute left-0 w-full ${height} ${colorClass}`}
                  style={{ 
                    top: index === 0 ? "10px" : "0",
                    height: isLastBlock ? "0" : "32px" 
                  }}
                />
              );
            })}
          </div>

          {activeBlocks.map((block, index) => {
            const status = getBlockStatus(block.block_id);
            const position = getBlockPosition(block.block_id);
            
            return (
              <div
                key={block.block_id}
                className={cn(
                  "relative w-full text-left flex items-center py-3 px-3 rounded-md transition-all cursor-default",
                  {
                    "bg-[#cdebe1]": status === "attivo",
                    "": status !== "attivo"
                  }
                )}
              >
                <div className="mr-4 shrink-0 z-10 relative">
                  {/* Indicatore di stato */}
                  {status === "completato" ? (
                    // Completed step: solid green circle
                    <div className="w-5 h-5">
                      <div className="w-[10px] h-[10px] rounded-full bg-[#007d65] mx-auto" />
                    </div>
                  ) : status === "attivo" ? (
                    // Current step: green circle with light green halo
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#cdebe1] flex items-center justify-center">
                        <div className="w-[10px] h-[10px] rounded-full bg-[#007d65]" />
                      </div>
                    </div>
                  ) : status === "parziale" ? (
                    // Partial step: gray circle with half filling
                    <div className="w-5 h-5">
                      <div className="w-[10px] h-[10px] rounded-full border border-[#6f6c66] mx-auto relative">
                        <div className="absolute inset-0 bg-[#6f6c66] rounded-full clip-half" />
                      </div>
                    </div>
                  ) : (
                    // Upcoming step: gray circle
                    <div className="w-5 h-5">
                      <div className="w-[10px] h-[10px] rounded-full border border-[#6f6c66] mx-auto" />
                    </div>
                  )}
                </div>
                
                <div 
                  className={cn(
                    "truncate text-sm",
                    {
                      "text-[#007d65] font-bold": status === "attivo",
                      "text-[#007d65]": status === "completato",
                      "text-[#6f6c66]": status === "non iniziato" || status === "parziale"
                    }
                  )}
                >
                  {block.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
