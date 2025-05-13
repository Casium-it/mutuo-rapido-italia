
import { Block, Question } from "@/types/form";

/**
 * Gets the previous question of a given question in a block
 * @param blocks All form blocks
 * @param blockId Current block ID
 * @param questionId Current question ID
 * @returns The previous question or undefined if none exists
 */
export const getPreviousQuestion = (
  blocks: Block[],
  blockId: string,
  questionId: string
): Question | undefined => {
  const currentBlock = blocks.find(block => block.block_id === blockId);
  if (!currentBlock) return undefined;

  const questionIndex = currentBlock.questions.findIndex(q => q.question_id === questionId);
  if (questionIndex <= 0) return undefined;

  return currentBlock.questions[questionIndex - 1];
};

/**
 * Gets the text value with responses from a question
 * @param question The question object
 * @param responses The form responses
 * @returns Text with responses inserted
 */
export const getQuestionTextWithResponses = (
  question: Question,
  responses: { [question_id: string]: { [placeholder_key: string]: string | string[] } }
): string => {
  if (!question || !question.question_text) return "";

  let text = question.question_text;
  
  Object.keys(question.placeholders || {}).forEach(key => {
    const placeholder = `{{${key}}}`;
    const responseValue = responses[question.question_id]?.[key];
    
    if (responseValue) {
      let displayValue = "";
      
      // Handle select type placeholders
      if (question.placeholders[key].type === "select" && !Array.isArray(responseValue)) {
        const option = (question.placeholders[key] as any).options.find(
          (opt: any) => opt.id === responseValue
        );
        if (option) {
          displayValue = option.label;
        }
      } else {
        // Handle other types
        displayValue = Array.isArray(responseValue) 
          ? responseValue.join(", ") 
          : responseValue.toString();
      }
      
      text = text.replace(placeholder, displayValue);
    }
  });
  
  // Replace any remaining placeholders
  text = text.replace(/\{\{[^}]+\}\}/g, "____");
  
  return text;
};
