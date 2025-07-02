import { Block } from "@/types/form";

/**
 * Finds question information (block ID and question text) from available blocks
 * @param questionId - The question ID to search for
 * @param staticBlocks - Static blocks from FormContext
 * @param dynamicBlocks - Dynamic blocks from FormState
 * @returns Object with blockId and questionText, or null if not found
 */
export function findQuestionInfo(
  questionId: string,
  staticBlocks: Block[],
  dynamicBlocks: Block[]
): { blockId: string; questionText: string } | null {
  // Search in static blocks first
  for (const block of staticBlocks) {
    const question = block.questions.find(q => q.question_id === questionId);
    if (question) {
      return {
        blockId: block.block_id,
        questionText: question.question_text
      };
    }
  }
  
  // Search in dynamic blocks
  for (const block of dynamicBlocks) {
    const question = block.questions.find(q => q.question_id === questionId);
    if (question) {
      return {
        blockId: block.block_id,
        questionText: question.question_text
      };
    }
  }
  
  return null;
}