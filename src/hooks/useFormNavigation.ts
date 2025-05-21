
import { useForm } from "@/contexts/FormContext";
import { Block, Question, NavigationHistory } from "@/types/form";
import { getChainOfInlineQuestions } from "@/utils/formUtils";
import { getPreviousQuestion as getPreviousQuestionUtil } from "@/utils/formUtils";
import { getQuestionTextWithResponses } from "@/utils/formUtils";

/**
 * Hook per gestire la navigazione tra domande e blocchi nel form
 */
export const useFormNavigation = () => {
  const formContext = useForm();

  /**
   * Gets the text of the previous question with responses filled in
   * @param blockId Current block ID
   * @param questionId Current question ID
   * @returns The previous question's text with responses or empty string
   */
  const getPreviousQuestionText = (blockId: string, questionId: string): string => {
    const previousQuestion = getPreviousQuestionUtil(
      formContext.blocks,
      blockId,
      questionId
    );
    
    if (!previousQuestion) return "";
    
    return getQuestionTextWithResponses(previousQuestion, formContext.state.responses);
  };
  
  /**
   * Gets the previous question object
   * @param blockId Current block ID
   * @param questionId Current question ID
   * @returns The previous question object or undefined
   */
  const getPreviousQuestion = (blockId: string, questionId: string) => {
    return getPreviousQuestionUtil(formContext.blocks, blockId, questionId);
  };

  /**
   * Gets all previous inline questions in a chain, starting from the current question
   * @param blockId Current block ID
   * @param questionId Current question ID
   * @returns Array of previous questions in the chain, ordered from first to last
   */
  const getInlineQuestionChain = (blockId: string, questionId: string): Question[] => {
    // Se la domanda è inline, troviamo da dove viene l'utente attraverso la cronologia
    const question = formContext.blocks
      .find(b => b.block_id === blockId)
      ?.questions.find(q => q.question_id === questionId);
    
    if (question?.inline) {
      // Cerca nella cronologia di navigazione da dove l'utente è arrivato a questa domanda
      const navigationHistory = formContext.getNavigationHistoryFor(questionId);
      
      if (navigationHistory) {
        // Trova la domanda da cui l'utente è arrivato
        const sourceQuestion = formContext.blocks
          .find(b => b.block_id === navigationHistory.from_block_id)
          ?.questions.find(q => q.question_id === navigationHistory.from_question_id);
        
        if (sourceQuestion) {
          // Restituisci la catena formata dalla domanda di origine
          return [sourceQuestion];
        }
      }
    }
    
    // Fallback al comportamento precedente se non troviamo una cronologia
    return getChainOfInlineQuestions(formContext.blocks, blockId, questionId);
  };

  /**
   * Navigate to a specific dynamic block
   * @param blockId The ID of the block to navigate to
   * @returns True if navigation was successful, false otherwise
   */
  const navigateToDynamicBlock = (blockId: string): boolean => {
    // Trova il blocco dinamico per ID
    const dynamicBlock = formContext.state.dynamicBlocks.find(b => b.block_id === blockId);
    
    if (!dynamicBlock || dynamicBlock.questions.length === 0) {
      console.error("Blocco dinamico non trovato o senza domande:", blockId);
      return false;
    }
    
    const firstQuestionId = dynamicBlock.questions[0].question_id;
    console.log(`Navigazione al blocco: ${blockId}, domanda: ${firstQuestionId}`);
    formContext.goToQuestion(blockId, firstQuestionId);
    return true;
  };

  /**
   * Get navigation history for a specific question
   * @param questionId The question ID to get history for
   * @returns The navigation history entry or undefined
   */
  const getNavigationHistoryFor = (questionId: string): NavigationHistory | undefined => {
    return formContext.getNavigationHistoryFor(questionId);
  };

  /**
   * Find block ID by question ID
   * @param questionId The question ID to find the block for
   * @returns The block ID or an empty string if not found
   */
  const findBlockByQuestionId = (questionId: string): string => {
    const allBlocks = formContext.blocks;
    
    for (const block of allBlocks) {
      const hasQuestion = block.questions.some(q => q.question_id === questionId);
      if (hasQuestion) {
        return block.block_id;
      }
    }
    
    return '';
  };

  return {
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    navigateToDynamicBlock,
    getNavigationHistoryFor,
    findBlockByQuestionId,
    goToQuestion: formContext.goToQuestion,
    navigateToNextQuestion: formContext.navigateToNextQuestion,
  };
};
