import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { 
  getPreviousQuestion as getPreviousQuestionUtil, 
  getQuestionTextWithResponses,
  getChainOfInlineQuestions
} from "@/utils/formUtils";
import { useCallback } from "react";
import { Question } from "@/types/form";

/**
 * Extended hook for the form context with additional functionality
 */
export const useFormExtended = () => {
  const formContext = useOriginalForm();
  
  /**
   * Gets the text of the previous question with responses filled in
   * @returns The previous question's text with responses or empty string
   */
  const getPreviousQuestionText = useCallback(() => {
    const previousQuestion = getPreviousQuestionUtil(
      formContext.blocks,
      formContext.state.activeQuestion.block_id,
      formContext.state.activeQuestion.question_id
    );
    
    if (!previousQuestion) return "";
    
    return getQuestionTextWithResponses(previousQuestion, formContext.state.responses);
  }, [formContext.state.activeQuestion.block_id, formContext.state.activeQuestion.question_id, formContext.blocks, formContext.state.responses]);
  
  /**
   * Gets the previous question object
   * @param blockId Current block ID
   * @param questionId Current question ID
   * @returns The previous question object or undefined
   */
  const getPreviousQuestion = useCallback(() => {
    return getPreviousQuestionUtil(formContext.blocks, formContext.state.activeQuestion.block_id, formContext.state.activeQuestion.question_id);
  }, [formContext.state.activeQuestion.block_id, formContext.state.activeQuestion.question_id, formContext.blocks]);

  /**
   * Gets all previous inline questions in a chain, starting from the current question
   * @param blockId Current block ID
   * @param questionId Current question ID
   * @returns Array of previous questions in the chain, ordered from first to last
   */
  const getInlineQuestionChain = useCallback((blockId: string, questionId: string) => {
    return getChainOfInlineQuestions(
      formContext.blocks,
      blockId,
      questionId
    );
  }, [formContext.blocks]);
  
  // Nuova funzione per ottenere una domanda specifica dal suo ID
  const getQuestionFromId = useCallback((questionId: string): Question | null => {
    for (const block of formContext.blocks) {
      for (const question of block.questions) {
        if (question.question_id === questionId) {
          return question;
        }
      }
    }
    return null;
  }, [formContext.blocks]);
  
  return {
    ...formContext,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    getQuestionFromId
  };
};
