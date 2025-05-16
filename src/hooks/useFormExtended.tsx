
import { useForm as useOriginalForm } from "@/contexts/FormContext";
import { 
  getPreviousQuestion as getPreviousQuestionUtil, 
  getQuestionTextWithResponses,
  getChainOfInlineQuestions
} from "@/utils/formUtils";
import { Question, RepeatingGroupEntry } from "@/types/form";
import { v4 as uuidv4 } from 'uuid';

// Logger per debugging, visibile solo in ambiente di sviluppo
const debugLog = (message: string, ...data: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[useFormExtended] ${message}`, ...data);
  }
};

/**
 * Hook esteso per il contesto del form con funzionalità aggiuntive
 */
export const useFormExtended = () => {
  const formContext = useOriginalForm();
  
  /**
   * Ottiene il testo della domanda precedente con le risposte inserite
   * @param blockId ID del blocco corrente
   * @param questionId ID della domanda corrente
   * @returns Il testo della domanda precedente con risposte o stringa vuota
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
   * Ottiene l'oggetto della domanda precedente
   * @param blockId ID del blocco corrente
   * @param questionId ID della domanda corrente
   * @returns L'oggetto della domanda precedente o undefined
   */
  const getPreviousQuestion = (blockId: string, questionId: string) => {
    return getPreviousQuestionUtil(formContext.blocks, blockId, questionId);
  };

  /**
   * Ottiene tutte le domande inline precedenti in una catena, a partire dalla domanda corrente
   * @param blockId ID del blocco corrente
   * @param questionId ID della domanda corrente
   * @returns Array di domande precedenti nella catena, ordinate dalla prima all'ultima
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
   * Ottiene le voci per un loop specifico
   * @param loopId ID del loop
   * @returns Array di voci o undefined
   */
  const getLoopEntries = (loopId: string): RepeatingGroupEntry[] | undefined => {
    try {
      return formContext.state.repeatingGroups?.[loopId]?.entries || [];
    } catch (error) {
      debugLog(`Errore nell'ottenere le entries del loop ${loopId}`, error);
      return [];
    }
  };
  
  /**
   * Inizia una nuova voce in un loop
   * @param loopId ID del loop
   */
  const startNewLoopEntry = (loopId: string) => {
    debugLog(`Avvio nuova voce del loop per ${loopId}`);
    formContext.startLoopEntry(loopId);
  };
  
  /**
   * Modifica una voce esistente in un loop
   * @param loopId ID del loop
   * @param entryIndex Indice della voce da modificare
   */
  const editLoopEntry = (loopId: string, entryIndex: number) => {
    debugLog(`Modifica voce del loop ${entryIndex} per ${loopId}`);
    formContext.editLoopEntry(loopId, entryIndex);
  };
  
  /**
   * Elimina una voce da un loop
   * @param loopId ID del loop
   * @param entryIndex Indice della voce da eliminare
   */
  const deleteLoopEntry = (loopId: string, entryIndex: number) => {
    debugLog(`Eliminazione voce del loop ${entryIndex} per ${loopId}`);
    formContext.deleteLoopEntry(loopId, entryIndex);
  };
  
  /**
   * Salva la voce corrente del loop
   */
  const saveCurrentLoopEntry = () => {
    debugLog(`Salvataggio della voce corrente del loop`);
    formContext.saveCurrentLoopEntry();
  };
  
  /**
   * Controlla se la domanda corrente è un gestore di loop
   * @returns Booleano che indica se la domanda corrente è un gestore di loop
   */
  const isLoopManager = (): boolean => {
    const { block_id, question_id } = formContext.state.activeQuestion;
    const question = formContext.blocks
      .find(b => b.block_id === block_id)
      ?.questions.find(q => q.question_id === question_id);
    
    return !!question?.loop_manager;
  };
  
  /**
   * Ottiene le informazioni del gestore di loop per la domanda corrente
   * @returns Oggetto con le informazioni del gestore di loop o null
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

  /**
   * Verifica se una domanda fa parte di un loop specifico
   * @param questionId ID della domanda
   * @param loopId ID del loop (opzionale)
   * @returns Booleano che indica se la domanda fa parte del loop
   */
  const isQuestionInLoop = (questionId: string, loopId?: string): boolean => {
    // Trova la domanda nei blocchi
    for (const block of formContext.blocks) {
      for (const question of block.questions) {
        if (question.question_id === questionId) {
          // Se loopId è specificato, controlla che corrisponda
          if (loopId) {
            return question.loop === loopId;
          }
          // Altrimenti controlla solo se fa parte di un qualsiasi loop
          return !!question.loop;
        }
      }
    }
    return false;
  };
  
  /**
   * Ottiene lo stato corrente del loop
   * @returns L'ID del loop corrente o null se non è attivo nessun loop
   */
  const getCurrentLoopState = () => {
    return formContext.state.currentLoop;
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
    getLoopManagerInfo,
    isQuestionInLoop,
    getCurrentLoopState
  };
};
