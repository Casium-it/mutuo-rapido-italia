
import { Block, Question, FormResponse } from "@/types/form";

/**
 * Gets the previous question in a block
 * @param blocks Array of blocks
 * @param blockId Current block ID
 * @param questionId Current question ID
 * @returns The previous question object or undefined
 */
export const getPreviousQuestion = (
  blocks: Block[],
  blockId: string,
  questionId: string
): Question | undefined => {
  const block = blocks.find((b) => b.block_id === blockId);
  if (!block) return undefined;

  const questionIndex = block.questions.findIndex((q) => q.question_id === questionId);
  if (questionIndex <= 0) return undefined;

  return block.questions[questionIndex - 1];
};

/**
 * Gets the next question in a block
 * @param blocks Array of blocks
 * @param blockId Current block ID
 * @param questionId Current question ID
 * @returns The next question object or undefined
 */
export const getNextQuestion = (
  blocks: Block[],
  blockId: string,
  questionId: string
): Question | undefined => {
  const block = blocks.find((b) => b.block_id === blockId);
  if (!block) return undefined;

  const questionIndex = block.questions.findIndex((q) => q.question_id === questionId);
  if (questionIndex === -1 || questionIndex >= block.questions.length - 1) return undefined;

  return block.questions[questionIndex + 1];
};

/**
 * Gets the text of a question with responses filled in
 * @param question Question object
 * @param responses Form responses
 * @returns The question's text with responses
 */
export const getQuestionTextWithResponses = (
  question: Question,
  responses: FormResponse
): string => {
  let text = question.question_text;
  Object.keys(question.placeholders).forEach((key) => {
    const placeholder = `{{${key}}}`;
    const responseValue = responses[question.question_id]?.[key];
    if (responseValue) {
      text = text.replace(placeholder, responseValue.toString());
    }
  });
  return text;
};

/**
 * Gets all previous inline questions in a chain, starting from the current question
 * @param blocks Array of blocks
 * @param blockId Current block ID
 * @param questionId Current question ID
 * @returns Array of previous questions in the chain, ordered from first to last
 */
export const getChainOfInlineQuestions = (
  blocks: Block[],
  blockId: string,
  questionId: string
): Question[] => {
  let chain: Question[] = [];
  let currentQuestion = blocks
    .find((b) => b.block_id === blockId)
    ?.questions.find((q) => q.question_id === questionId);

  while (currentQuestion?.inline) {
    const previousQuestion = getPreviousQuestion(blocks, blockId, currentQuestion.question_id);
    if (!previousQuestion) break;

    chain.unshift(previousQuestion);
    currentQuestion = previousQuestion;
  }

  return chain;
};

/**
 * Gets question text with clickable responses for already answered questions
 * @param question Question object
 * @param responses Form responses
 * @returns Object containing parts of the text with type and content
 */
export const getQuestionTextWithClickableResponses = (
  question: Question,
  responses: FormResponse
): { parts: Array<{ type: 'text' | 'response', content: string }> } => {
  let result: Array<{ type: 'text' | 'response', content: string }> = [];
  let text = question.question_text;
  let lastIndex = 0;
  
  // Find all placeholders in the text
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  let match;
  
  while ((match = placeholderRegex.exec(text)) !== null) {
    // Add the text before the placeholder
    if (match.index > lastIndex) {
      result.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }
    
    // Get the placeholder key
    const key = match[1];
    const responseValue = responses[question.question_id]?.[key];
    
    // Add the placeholder value or the placeholder itself
    if (responseValue) {
      result.push({
        type: 'response',
        content: responseValue.toString()
      });
    } else {
      result.push({
        type: 'text',
        content: match[0]
      });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    result.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }
  
  return { parts: result };
};

export const getSafeNavigationTarget = (
  history: any[], 
  currentBlockId: string, 
  currentQuestionId: string, 
  visitedPairs: Set<string>
) => {
  const currentPair = `${currentBlockId}:${currentQuestionId}`;
  visitedPairs.add(currentPair);
  
  // Trova l'ultima entry che porta alla domanda corrente
  const historyEntry = history.find(item => {
    if (item.to_block_id === currentBlockId && item.to_question_id === currentQuestionId) {
      const targetPair = `${item.from_block_id}:${item.from_question_id}`;
      
      // Se già abbiamo visitato questa domanda, saltiamola per evitare loop
      if (visitedPairs.has(targetPair)) {
        return false;
      }
      
      return true;
    }
    return false;
  });
  
  return historyEntry;
};
