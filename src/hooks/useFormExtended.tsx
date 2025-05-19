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
   * Identifica le domande terminali per un blocco - quelle che portano fuori dal blocco
   * @param block Il blocco da analizzare
   * @returns Array di ID delle domande terminali
   */
  const getTerminalQuestionsForBlock = (block: Block): string[] => {
    const terminalQuestionIds: string[] = [];
    const blockId = block.block_id;
    
    // Itera attraverso le domande per trovare quelle che portano fuori dal blocco
    block.questions.forEach(question => {
      let isTerminal = false;
      
      // Caso speciale per l'ultima domanda del blocco
      if (question === block.questions[block.questions.length - 1]) {
        isTerminal = true;
      }
      
      // Controlla i placeholder per i percorsi leads_to
      Object.entries(question.placeholders).forEach(([_, placeholder]) => {
        if (placeholder.type === "select") {
          // Controlla se qualche opzione porta fuori da questo blocco
          (placeholder.options || []).forEach(option => {
            if (
              option.leads_to === "next_block" || 
              (option.leads_to && !option.leads_to.includes(blockId))
            ) {
              isTerminal = true;
            }
          });
        } else if ((placeholder as any).leads_to) {
          // Controlla se l'input porta fuori da questo blocco
          const leadsTo = (placeholder as any).leads_to;
          if (
            leadsTo === "next_block" || 
            !leadsTo.includes(blockId)
          ) {
            isTerminal = true;
          }
        } else if (placeholder.type === "MultiBlockManager") {
          // MultiBlockManager è sempre terminale
          isTerminal = true;
        }
      });
      
      if (isTerminal) {
        terminalQuestionIds.push(question.question_id);
      }
    });
    
    return terminalQuestionIds;
  };

  /**
   * Check if a specific block has all questions answered
   * @param blockId The ID of the block to check
   * @returns True if all questions in the block are answered, false otherwise
   */
  const isBlockComplete = (blockId: string): boolean => {
    const block = formContext.blocks.find(b => b.block_id === blockId);
    if (!block) return false;
    
    // Ottieni tutte le domande terminali per questo blocco
    const terminalQuestions = getTerminalQuestionsForBlock(block);
    
    // Un blocco è completo se almeno una delle sue domande terminali è stata risposta
    if (terminalQuestions.some(questionId => formContext.isQuestionAnswered(questionId))) {
      return true;
    }
    
    // Gestione speciale per blocchi dinamici
    // Se il blocco è stato creato da un MultiBlockManager, controlliamo l'ultima domanda
    if (block.blueprint_id && block.questions.length > 0) {
      // Per i blocchi dinamici, controlla se l'ultima domanda è stata risposta
      // Questo è spesso una domanda di "ritorno" al MultiBlockManager
      const lastQuestion = block.questions[block.questions.length - 1];
      if (formContext.isQuestionAnswered(lastQuestion.question_id)) {
        return true;
      }
    }
    
    // Se non è stato trovato nessun percorso di completamento, il blocco non è completo
    return false;
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
    createAndNavigateToBlock,
    getBlockResponseSummary,
    getTerminalQuestionsForBlock
  };
};
