
import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { 
  getPreviousQuestion as getPreviousQuestionUtil, 
  getQuestionTextWithResponses,
  getChainOfInlineQuestions
} from "@/utils/formUtils";
import { Question, StandardBlock, Block, RepeatingGroupBlock } from "@/types/form";

/**
 * Funzione di utilità per verificare se un blocco è di tipo StandardBlock
 */
const isStandardBlock = (block: Block): block is StandardBlock => {
  return !('type' in block) || block.type !== 'repeating_group';
};

/**
 * Funzione di utilità per verificare se un blocco è di tipo RepeatingGroupBlock
 */
const isRepeatingGroupBlock = (block: Block): block is RepeatingGroupBlock => {
  return 'type' in block && block.type === 'repeating_group';
};

/**
 * Extended hook for the form context with additional functionality
 */
export const useFormExtended = () => {
  const formContext = useOriginalForm();
  
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
    // Verifica prima che si tratti di un blocco standard
    const block = formContext.blocks.find(b => b.block_id === blockId);
    if (!block || isRepeatingGroupBlock(block)) {
      return [];
    }

    const standardBlock = block;
    
    // Se la domanda è inline, troviamo da dove viene l'utente attraverso la cronologia
    const question = standardBlock.questions.find(q => q.question_id === questionId);
    
    if (question?.inline) {
      // Cerca nella cronologia di navigazione da dove l'utente è arrivato a questa domanda
      const navigationHistory = formContext.getNavigationHistoryFor(questionId);
      
      if (navigationHistory) {
        // Trova la domanda da cui l'utente è arrivato
        const sourceBlockId = navigationHistory.from_block_id;
        const sourceBlock = formContext.blocks.find(b => b.block_id === sourceBlockId);
        
        // Verifica che il blocco di origine sia un blocco standard
        if (sourceBlock && isStandardBlock(sourceBlock)) {
          const standardSourceBlock = sourceBlock;
          const sourceQuestion = standardSourceBlock.questions.find(
            q => q.question_id === navigationHistory.from_question_id
          );
          
          if (sourceQuestion) {
            // Restituisci la catena formata dalla domanda di origine
            return [sourceQuestion];
          }
        }
      }
    }
    
    // Fallback al comportamento precedente se non troviamo una cronologia
    return getChainOfInlineQuestions(
      formContext.blocks,
      blockId,
      questionId
    );
  };
  
  return {
    ...formContext,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain
  };
};
