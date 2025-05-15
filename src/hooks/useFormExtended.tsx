
import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { 
  getPreviousQuestion as getPreviousQuestionUtil, 
  getQuestionTextWithResponses,
  getChainOfInlineQuestions,
  generateUniqueId
} from "@/utils/formUtils";
import { Question, IncomeSource } from "@/types/form";

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

  // Aggiungiamo una funzione ausiliaria per gestire la navigazione speciale per i redditi
  const navigateToNextQuestion = (currentQuestionId: string, leadsTo: string) => {
    // Trova la domanda corrente
    let currentQuestion: Question | undefined;
    for (const block of formContext.blocks) {
      const question = block.questions.find(q => q.question_id === currentQuestionId);
      if (question) {
        currentQuestion = question;
        break;
      }
    }
    
    // Se la domanda corrente è l'ultima di un flusso di dettagli reddito
    // e stiamo navigando alla gestione redditi, marchiamo la fonte come completa
    if (currentQuestion?.is_last_income_detail) {
      const currentIncomeSource = formContext.getCurrentIncomeSource();
      if (currentIncomeSource) {
        // Marchiamo la fonte di reddito come completa
        formContext.updateIncomeSourceDetail('isComplete', true);
      }
    }
    
    // Se stiamo selezionando un nuovo tipo di reddito secondario
    if (currentQuestionId === "nuovo_reddito_secondario" && leadsTo.startsWith("dettagli_")) {
      // Estrai il tipo di reddito dal leads_to
      const incomeType = leadsTo.replace("dettagli_", "");
      
      // Crea una nuova fonte di reddito
      formContext.addIncomeSource(incomeType);
    }
    
    // Delega alla funzione originale per la navigazione effettiva
    formContext.navigateToNextQuestion(currentQuestionId, leadsTo);
  };
  
  return {
    ...formContext,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    // Sostituisci la funzione di navigazione con la nostra versione estesa
    navigateToNextQuestion
  };
};
