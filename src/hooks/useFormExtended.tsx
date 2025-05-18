import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { 
  getPreviousQuestion as getPreviousQuestionUtil, 
  getQuestionTextWithResponses,
  getChainOfInlineQuestions
} from "@/utils/formUtils";
import { Question, Block } from "@/types/form";

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
   * Checks if a block is invisible
   * @param blockId Block ID
   * @returns True if the block is invisible, false otherwise
   */
  const isBlockInvisible = (blockId: string): boolean => {
    const block = formContext.blocks.find(b => b.block_id === blockId);
    return !!block?.invisible;
  };
  
  /**
   * Creates a dynamic block based on a blueprint without navigating to it
   * @param blockBlueprintId The ID of the block blueprint to use
   * @returns The ID of the created block or null if creation failed
   */
  const createDynamicBlock = (blockBlueprintId: string): string | null => {
    console.log(`Creazione blocco dinamico dal blueprint: ${blockBlueprintId}`);
    
    try {
      // Create the dynamic block
      const newBlockId = formContext.createDynamicBlock(blockBlueprintId);
      console.log(`Nuovo blocco creato con ID: ${newBlockId}`);
      
      return newBlockId;
    } catch (error) {
      console.error("Errore nella creazione del blocco dinamico:", error);
      return null;
    }
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
   * Delete a specific dynamic block
   * @param blockId The ID of the dynamic block to delete
   */
  const deleteDynamicBlock = (blockId: string): boolean => {
    return formContext.deleteDynamicBlock(blockId);
  };

  /**
   * Check if a specific block has all questions answered
   * @param blockId The ID of the block to check
   * @returns True if all questions in the block are answered, false otherwise
   */
  const isBlockComplete = (blockId: string): boolean => {
    const block = formContext.blocks.find(b => b.block_id === blockId);
    if (!block) return false;
    
    // Check if all questions in the block have been answered
    return block.questions.every(question => 
      formContext.isQuestionAnswered(question.question_id)
    );
  };

  /**
   * Get all dynamic blocks of a specific blueprint type
   * @param blueprintId The blueprint ID to filter by
   * @returns Array of dynamic blocks matching the blueprint type
   */
  const getDynamicBlocksByBlueprint = (blueprintId: string): Block[] => {
    if (!blueprintId) return [];
    
    const dynamicBlueprint = blueprintId.includes("{copyNumber}") ? 
      blueprintId : 
      `${blueprintId}{copyNumber}`;
      
    return formContext.state.dynamicBlocks
      .filter(block => block.blueprint_id === blueprintId || 
                       block.blueprint_id === dynamicBlueprint);
  };

  /**
   * Check if all dynamic blocks of a specific blueprint type are complete
   * @param blueprintId The blueprint ID to check
   * @returns True if all blocks of the blueprint type are complete, false otherwise
   */
  const areAllDynamicBlocksComplete = (blueprintId: string): boolean => {
    const blocks = getDynamicBlocksByBlueprint(blueprintId);
    if (blocks.length === 0) return true; // Se non ci sono blocchi, consideriamo completato
    
    return blocks.every(block => isBlockComplete(block.block_id));
  };
  
  /**
   * Creates a dynamic block based on a blueprint and optionally navigates to it
   * @param blockBlueprintId The ID of the block blueprint to use
   * @param navigateToBlock Whether to navigate to the new block after creation
   * @returns The ID of the created block or null if creation failed
   */
  const createAndNavigateToBlock = (blockBlueprintId: string, navigateToBlock: boolean = false): string | null => {
    console.log(`Creazione blocco dinamico dal blueprint: ${blockBlueprintId}`);
    
    try {
      // Create the dynamic block
      const newBlockId = formContext.createDynamicBlock(blockBlueprintId);
      console.log(`Nuovo blocco creato con ID: ${newBlockId}`);
      
      if (newBlockId && navigateToBlock) {
        navigateToDynamicBlock(newBlockId);
      }
      
      return newBlockId;
    } catch (error) {
      console.error("Errore nella creazione del blocco dinamico:", error);
      return null;
    }
  };
  
  return {
    ...formContext,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    isBlockInvisible,
    createDynamicBlock,
    navigateToDynamicBlock,
    deleteDynamicBlock,
    isBlockComplete,
    getDynamicBlocksByBlueprint,
    areAllDynamicBlocksComplete,
    createAndNavigateToBlock
  };
};
