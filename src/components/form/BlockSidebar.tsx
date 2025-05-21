
import { useFormExtended } from "@/hooks/useFormExtended";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { CircleCheck, ChevronRight, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function BlockSidebar() {
  const { blocks, state, isBlockCompleted, goToQuestion } = useFormExtended();
  const params = useParams<{ blockType?: string }>();
  
  // Stato per tenere traccia del primo blocco non completato dopo il controllo ritardato
  const [delayedFirstNonCompletedId, setDelayedFirstNonCompletedId] = useState<string | null>(null);
  
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

  // Ottiene l'ID del primo blocco non completato (o null se non esiste)
  const firstNonCompletedId = firstNonCompletedIndex >= 0 ? 
    activeBlocks[firstNonCompletedIndex].block_id : null;

  // Effetto per controllare lo stato del primo blocco non completato con un ritardo di 1 secondo
  useEffect(() => {
    // Resetta lo stato quando cambia il primo blocco non completato
    setDelayedFirstNonCompletedId(null);
    
    // Se esiste un primo blocco non completato, verifica dopo 1 secondo
    if (firstNonCompletedId) {
      const timer = setTimeout(() => {
        // Ricontrolliamo se questo blocco è ancora il primo non completato
        const currentFirstNonCompletedId = activeBlocks.find(
          block => !isBlockCompleted(block.block_id)
        )?.block_id;
        
        // Aggiorna lo stato solo se è ancora il primo blocco non completato
        if (currentFirstNonCompletedId === firstNonCompletedId) {
          setDelayedFirstNonCompletedId(currentFirstNonCompletedId);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [firstNonCompletedId, activeBlocks, isBlockCompleted]);

  return (
    <div className="w-full bg-[#FAF9F6] h-full py-6 overflow-y-auto border-r border-gray-200">
      <div className="px-4">
        <h2 className="text-base font-semibold text-gray-800 mb-6">Il tuo percorso</h2>
        <div className="space-y-1">
          {activeBlocks.map((block, index) => {
            const isActive = isBlockActive(block.block_id);
            const isCompleted = isBlockCompleted(block.block_id);
            
            // Un blocco è considerato il primo non completato SOLO se:
            // 1. È il blocco identificato nell'useEffect dopo il ritardo
            // 2. Non è il blocco attivo
            // 3. Non è completato
            const isFirstNonCompleted = 
              delayedFirstNonCompletedId === block.block_id && 
              !isActive && 
              !isCompleted;
            
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
                    
                    // First non-completed block styling (darker beige)
                    "bg-[#E8E2D7] text-gray-700": isFirstNonCompleted,
                    
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
                
                {/* First non-completed block icon - AlertCircle (dark red instead of Pencil) */}
                {isFirstNonCompleted && (
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <AlertCircle size={18} className="text-red-600" />
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
