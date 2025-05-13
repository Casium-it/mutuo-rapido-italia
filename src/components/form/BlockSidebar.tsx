
import { useForm } from "@/contexts/FormContext";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function BlockSidebar() {
  const { blocks, state, goToQuestion } = useForm();
  
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

  return (
    <div className="w-full bg-gray-100 border-r border-gray-200 h-full py-6 overflow-y-auto">
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Il tuo percorso</h2>
        <div className="space-y-0.5">
          {activeBlocks.map((block) => (
            <button
              key={block.block_id}
              onClick={() => navigateToBlock(block.block_id)}
              className={cn(
                "w-full text-left flex items-center py-2 px-3 rounded-md text-gray-700",
                isBlockActive(block.block_id)
                  ? "bg-vibe-green text-white font-medium"
                  : isBlockCompleted(block.block_id)
                  ? "bg-vibe-green/10 text-gray-700 font-medium"
                  : "hover:bg-gray-200"
              )}
            >
              <div className="mr-2 shrink-0">
                {isBlockCompleted(block.block_id) && <Check className="w-4 h-4 text-vibe-green" />}
              </div>
              <div className="truncate">{block.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
