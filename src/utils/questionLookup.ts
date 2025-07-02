
import { Block, Question } from "@/types/form";

export interface QuestionInfo {
  blockId: string;
  questionText: string;
  question: Question;
}

/**
 * Finds question information (blockId, questionText) for a given questionId
 * @param questionId - The ID of the question to find
 * @param staticBlocks - Static blocks from FormContext (cached database blocks)
 * @param dynamicBlocks - Dynamic blocks from FormState
 * @returns QuestionInfo object or null if not found
 */
export function findQuestionInfo(
  questionId: string,
  staticBlocks: Block[],
  dynamicBlocks: Block[] = []
): QuestionInfo | null {
  // Search in static blocks first (from FormContext/cache)
  for (const block of staticBlocks) {
    for (const question of block.questions) {
      if (question.question_id === questionId) {
        return {
          blockId: block.block_id,
          questionText: question.question_text,
          question
        };
      }
    }
  }
  
  // Search in dynamic blocks (from FormState)
  for (const block of dynamicBlocks) {
    for (const question of block.questions) {
      if (question.question_id === questionId) {
        return {
          blockId: block.block_id,
          questionText: question.question_text,
          question
        };
      }
    }
  }
  
  return null;
}

/**
 * Validates that all questions in responses can be found in the provided blocks
 * @param responses - Form responses object
 * @param staticBlocks - Static blocks from FormContext
 * @param dynamicBlocks - Dynamic blocks from FormState
 * @returns Array of missing question IDs
 */
export function validateQuestionsExist(
  responses: Record<string, any>,
  staticBlocks: Block[],
  dynamicBlocks: Block[] = []
): string[] {
  const missingQuestions: string[] = [];
  
  for (const questionId of Object.keys(responses)) {
    const questionInfo = findQuestionInfo(questionId, staticBlocks, dynamicBlocks);
    if (!questionInfo) {
      missingQuestions.push(questionId);
    }
  }
  
  return missingQuestions;
}
