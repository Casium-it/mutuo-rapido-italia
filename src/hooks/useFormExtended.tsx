
import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { 
  getPreviousQuestion as getPreviousQuestionUtil, 
  getQuestionTextWithResponses,
  getChainOfInlineQuestions
} from "@/utils/formUtils";
import { Question, RepeatingGroupEntry } from "@/types/form";
import { v4 as uuidv4 } from 'uuid';

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
    return getChainOfInlineQuestions(
      formContext.blocks,
      blockId,
      questionId
    );
  };

  /**
   * Get entries for a specific loop
   * @param loopId ID of the loop
   * @returns Array of entries or undefined
   */
  const getLoopEntries = (loopId: string): RepeatingGroupEntry[] | undefined => {
    return formContext.state.repeatingGroups?.[loopId]?.entries;
  };
  
  /**
   * Start a new entry in a loop
   * @param loopId ID of the loop
   */
  const startNewLoopEntry = (loopId: string) => {
    formContext.startLoopEntry(loopId);
  };
  
  /**
   * Edit an existing entry in a loop
   * @param loopId ID of the loop
   * @param entryIndex Index of the entry to edit
   */
  const editLoopEntry = (loopId: string, entryIndex: number) => {
    formContext.editLoopEntry(loopId, entryIndex);
  };
  
  /**
   * Delete an entry from a loop
   * @param loopId ID of the loop
   * @param entryIndex Index of the entry to delete
   */
  const deleteLoopEntry = (loopId: string, entryIndex: number) => {
    formContext.deleteLoopEntry(loopId, entryIndex);
  };
  
  /**
   * Save the current loop entry
   */
  const saveCurrentLoopEntry = () => {
    formContext.saveCurrentLoopEntry();
  };
  
  /**
   * Check if the current question is a loop manager
   * @returns Boolean indicating if the current question is a loop manager
   */
  const isLoopManager = (): boolean => {
    const { block_id, question_id } = formContext.state.activeQuestion;
    const question = formContext.blocks
      .find(b => b.block_id === block_id)
      ?.questions.find(q => q.question_id === question_id);
    
    return !!question?.loop_manager;
  };
  
  /**
   * Get loop manager information for the current question
   * @returns Object with loop manager info or null
   */
  const getLoopManagerInfo = () => {
    const { block_id, question_id } = formContext.state.activeQuestion;
    const question = formContext.blocks
      .find(b => b.block_id === block_id)
      ?.questions.find(q => q.question_id === question_id);
    
    if (question?.loop_manager) {
      return {
        loopId: question.loop_id || "",
        addLeadsTo: question.add_leads_to || "",
        nextLeadsTo: question.next_leads_to || ""
      };
    }
    
    return null;
  };
  
  return {
    ...formContext,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    getLoopEntries,
    startNewLoopEntry,
    editLoopEntry,
    deleteLoopEntry,
    saveCurrentLoopEntry,
    isLoopManager,
    getLoopManagerInfo
  };
};
