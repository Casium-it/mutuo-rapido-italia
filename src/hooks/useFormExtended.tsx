import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { 
  getPreviousQuestion as getPreviousQuestionUtil, 
  getQuestionTextWithResponses,
  getChainOfInlineQuestions
} from "@/utils/formUtils";
import { Question, Block } from "@/types/form";
import { useToast } from "@/hooks/use-toast";

/**
 * Extended hook for the form context with additional functionality
 */
export const useFormExtended = () => {
  const formContext = useOriginalForm();
  const { toast } = useToast();
  
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
   * Naviga a un blocco dinamico creato precedentemente
   * @param blockId L'ID del blocco dinamico a cui navigare
   * @returns True se la navigazione è avvenuta con successo, False altrimenti
   */
  const navigateToDynamicBlock = (blockId: string): boolean => {
    // Cerca il blocco nei blocchi dinamici
    const dynamicBlock = formContext.state.dynamicBlocks.find(b => b.block_id === blockId);
    
    if (!dynamicBlock || dynamicBlock.questions.length === 0) {
      console.error("Blocco dinamico non trovato o senza domande:", blockId);
      toast({
        title: "Errore",
        description: "Impossibile navigare al blocco richiesto",
        variant: "destructive"
      });
      return false;
    }
    
    // Naviga alla prima domanda del blocco
    const firstQuestionId = dynamicBlock.questions[0].question_id;
    console.log(`Navigazione al blocco dinamico: ${blockId}, domanda: ${firstQuestionId}`);
    formContext.goToQuestion(blockId, firstQuestionId);
    return true;
  };
  
  /**
   * Crea un blocco dinamico separatamente dalla navigazione
   * @param blockBlueprintId L'ID del blueprint del blocco da creare
   * @returns L'ID del blocco creato o null se la creazione è fallita
   */
  const createDynamicBlock = (blockBlueprintId: string): string | null => {
    console.log(`Creazione blocco dinamico dal blueprint: ${blockBlueprintId}`);
    
    try {
      // Crea il blocco dinamico
      const result = formContext.createDynamicBlock(blockBlueprintId);
      
      if (!result.blockId) {
        console.error("Creazione blocco fallita");
        toast({
          title: "Errore",
          description: "Impossibile creare il blocco richiesto",
          variant: "destructive"
        });
        return null;
      }
      
      console.log(`Nuovo blocco creato con ID: ${result.blockId}`);
      return result.blockId;
    } catch (error) {
      console.error("Errore nella creazione del blocco dinamico:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione del blocco",
        variant: "destructive"
      });
      return null;
    }
  };
  
  /**
   * Crea un blocco dinamico basato su un blueprint e naviga ad esso
   * @param blockBlueprintId L'ID del blueprint del blocco da utilizzare
   * @param navigateToBlock Se navigare al blocco dopo la creazione
   * @returns L'ID del blocco creato o null se la creazione è fallita
   */
  const createAndNavigateToBlock = (blockBlueprintId: string, navigateToBlock: boolean = true): string | null => {
    const blockId = createDynamicBlock(blockBlueprintId);
    
    if (blockId && navigateToBlock) {
      navigateToDynamicBlock(blockId);
    }
    
    return blockId;
  };
  
  return {
    ...formContext,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    isBlockInvisible,
    createAndNavigateToBlock,
    createDynamicBlock,
    navigateToDynamicBlock
  };
};
