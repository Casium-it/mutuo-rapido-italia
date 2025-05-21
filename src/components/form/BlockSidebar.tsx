
import { useForm } from "@/contexts/FormContext";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";

export function BlockSidebar() {
  const { blocks, state } = useForm();
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
            return (
              <div
                key={block.block_id}
                className={cn(
                  "w-full text-left flex items-center py-2 px-3 rounded-md transition-all cursor-default",
                  {
                    "bg-black text-white font-medium": isBlockActive(block.block_id),
                    "text-gray-700": !isBlockActive(block.block_id)
                  }
                )}
              >
                <div className="truncate text-sm">{block.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
