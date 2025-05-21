
import { useFormExtended } from "@/hooks/useFormExtended";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { Check } from "lucide-react";

export function BlockSidebar() {
  const { blocks, state, isBlockCompleted } = useFormExtended();
  const params = useParams<{ blockType?: string }>();
  
  // Filter blocks that are active and not invisible, and sort by priority
  const activeBlocks = blocks
    .filter(block => state.activeBlocks.includes(block.block_id) && !block.invisible)
    .sort((a, b) => a.priority - b.priority); // Ordinamento per priorità

  const isBlockActive = (blockId: string) => {
    return state.activeQuestion.block_id === blockId;
  };

  return (
    <div className="w-full bg-[#FAF9F6] h-full py-6 overflow-y-auto border-r border-gray-200">
      <div className="px-4">
        <h2 className="text-base font-semibold text-gray-800 mb-6">Il tuo percorso</h2>
        <div className="space-y-1">
          {activeBlocks.map((block) => {
            const isActive = isBlockActive(block.block_id);
            const isCompleted = isBlockCompleted(block.block_id);
            
            return (
              <div
                key={block.block_id}
                className={cn(
                  "w-full text-left flex items-center py-2 px-3 rounded-md transition-all cursor-default",
                  {
                    "bg-[#245C4F] text-white font-medium": isActive,
                    "bg-[#245C4F]/20 text-gray-700": isCompleted && !isActive, // Semi-transparent dark green
                    "text-gray-700": !isActive && !isCompleted
                  }
                )}
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
