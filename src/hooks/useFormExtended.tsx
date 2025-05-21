
import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { 
  getPreviousQuestion as getPreviousQuestionUtil, 
  getQuestionTextWithResponses,
  getChainOfInlineQuestions
} from "@/utils/formUtils";
import { Question, Block, Placeholder, InputPlaceholder } from "@/types/form";
import { formatCurrency, formatNumberWithThousandSeparator, capitalizeWords } from "@/lib/utils";

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
   * Remove a block from active blocks
   * @param blockId The ID of the block to remove
   */
  const removeActiveBlock = (blockId: string): void => {
    return formContext.removeActiveBlock(blockId);
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

  /**
   * Gets a summary of block responses for display in the dynamic block list
   * @param blockId The ID of the block to summarize
   * @returns HTML string with responses formatted (bold for answers)
   */
  const getBlockResponseSummary = (blockId: string): string => {
    const block = formContext.blocks.find(b => b.block_id === blockId) || 
                  formContext.state.dynamicBlocks.find(b => b.block_id === blockId);
                  
    if (!block || block.questions.length === 0) return "";
    
    // Cerchiamo le domande che hanno risposte
    const answeredQuestions = block.questions.filter(q => 
      formContext.state.answeredQuestions.has(q.question_id)
    );
    
    if (answeredQuestions.length === 0) return "";
    
    // Prendiamo solo le prime 2-3 domande per il riassunto (intentionally showing only a few)
    const questionsToSummarize = answeredQuestions.slice(0, 3);
    
    // Creiamo un riassunto formattato con le risposte in grassetto e con il colore verde del tema (#245C4F)
    const summaryParts = questionsToSummarize.map(question => {
      let text = question.question_text;
      
      Object.keys(question.placeholders || {}).forEach(key => {
        const placeholder = `{{${key}}}`;
        const responseValue = formContext.state.responses[question.question_id]?.[key];
        
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
            // Format based on placeholder validation or content type
            const placeholder_obj = question.placeholders[key];
            let validationType = "";
            
            // Check the placeholder type and get the validation type if it's an input
            if (placeholder_obj.type === "input") {
              validationType = (placeholder_obj as InputPlaceholder).input_validation;
            }
            
            if (Array.isArray(responseValue)) {
              displayValue = responseValue.join(", ");
            } else {
              const strValue = responseValue.toString();
              
              // Apply specific formatting ONLY for specific types
              if (validationType === "euro" || key.includes("euro") || key.includes("importo")) {
                // Format as currency
                const numValue = parseInt(strValue.replace(/\D/g, ""), 10);
                if (!isNaN(numValue)) {
                  displayValue = formatCurrency(numValue);
                } else {
                  displayValue = strValue;
                }
              } else if (validationType === "city" || key.includes("città") || key.includes("citta") || key.includes("comune")) {
                // Capitalize city names
                displayValue = capitalizeWords(strValue);
              } else if (validationType === "month" || key.includes("mese")) {
                // Capitalize month names
                displayValue = capitalizeWords(strValue);
              } else {
                // For all other values, no special formatting
                displayValue = strValue;
              }
            }
          }
          
          // Sostituisci il placeholder con il valore in grassetto e nel colore verde del tema (#245C4F)
          text = text.replace(placeholder, `<span class="font-bold text-[#245C4F]">${displayValue}</span>`);
        }
      });
      
      // Sostituisci i placeholder rimanenti
      text = text.replace(/\{\{[^}]+\}\}/g, "____");
      
      return text;
    });
    
    // Unisci tutto in una stringa HTML
    return summaryParts.join("<br>");
  };

  /**
   * Delete responses for specific questions
   * @param questionIds Array of question IDs to remove responses for
   */
  const deleteQuestionResponses = (questionIds: string[]) => {
    return formContext.deleteQuestionResponses(questionIds);
  };

  // For compatibility, provide a dummy implementation that always returns true
  const areAllDynamicBlocksComplete = (blueprintId: string): boolean => {
    return true;
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
    removeActiveBlock,
    getDynamicBlocksByBlueprint,
    areAllDynamicBlocksComplete,
    createAndNavigateToBlock,
    getBlockResponseSummary,
    deleteQuestionResponses
  };
};
