
import { useCallback } from "react";
import { Block } from "@/types/form";
import { FormState, FormAction } from "../context/FormTypes";

type FormHookProps = {
  dispatch: React.Dispatch<FormAction>;
  state: FormState;
};

/**
 * Hook per le funzioni di base del form
 */
export const useFormBasic = ({ dispatch, state }: FormHookProps) => {
  // Imposta una risposta per una domanda
  const setResponse = useCallback((question_id: string, placeholder_key: string, value: string | string[]) => {
    dispatch({ 
      type: "SET_RESPONSE", 
      question_id, 
      placeholder_key, 
      value 
    });
    dispatch({ type: "MARK_QUESTION_ANSWERED", question_id });
  }, [dispatch]);

  // Ottieni una risposta
  const getResponse = useCallback((question_id: string, placeholder_key: string) => {
    if (!state.responses[question_id]) return undefined;
    return state.responses[question_id][placeholder_key];
  }, [state.responses]);

  // Aggiungi un blocco attivo
  const addActiveBlock = useCallback((block_id: string, sourceQuestionId?: string, sourcePlaceholderId?: string) => {
    dispatch({ 
      type: "ADD_ACTIVE_BLOCK", 
      block_id, 
      sourceQuestionId, 
      sourcePlaceholderId 
    });
  }, [dispatch]);

  // Rimuovi un blocco attivo
  const removeActiveBlock = useCallback((block_id: string) => {
    dispatch({ type: "REMOVE_ACTIVE_BLOCK", block_id });
  }, [dispatch]);

  // Controlla se una domanda è stata risposta
  const isQuestionAnswered = useCallback((question_id: string) => {
    return state.answeredQuestions.has(question_id);
  }, [state.answeredQuestions]);

  // Eliminazione delle risposte a domande specifiche
  const deleteQuestionResponses = useCallback((questionIds: string[]) => {
    if (!questionIds || questionIds.length === 0) return;
    dispatch({ type: "DELETE_QUESTION_RESPONSES", questionIds });
  }, [dispatch]);

  // Calcola la percentuale di avanzamento del form
  const getProgress = useCallback(() => {
    // Ottieni tutti i blocchi (statici + dinamici)
    const allBlocks = state.dynamicBlocks;
    
    // Filtra i blocchi invisibili dagli attivi
    const visibleActiveBlocks = state.activeBlocks
      .map(blockId => allBlocks.find(b => b.block_id === blockId))
      .filter(block => block && !block.invisible) as Block[];
    
    // Se non ci sono blocchi visibili, restituisci 0
    if (visibleActiveBlocks.length === 0) return 0;
    
    // Calcola il peso di ciascun blocco (contributo uguale)
    const blockWeight = 100 / visibleActiveBlocks.length;
    
    // Calcola il progresso totale
    let totalProgress = 0;
    
    visibleActiveBlocks.forEach(block => {
      // Se il blocco è contrassegnato come completato, aggiungi il peso completo del blocco
      if (state.completedBlocks.includes(block.block_id)) {
        totalProgress += blockWeight;
      } else {
        // Altrimenti calcola il contributo parziale in base alle domande risposte
        const totalQuestions = block.questions.length;
        let answeredQuestions = 0;
        
        // Conta le domande risposte in questo blocco
        block.questions.forEach(question => {
          if (state.answeredQuestions.has(question.question_id)) {
            answeredQuestions++;
          }
        });
        
        // Aggiungi il progresso parziale del blocco se ci sono domande
        if (totalQuestions > 0) {
          const blockProgress = (answeredQuestions / totalQuestions) * blockWeight;
          totalProgress += blockProgress;
        }
      }
    });
    
    // Restituisci il progresso arrotondato
    return Math.round(totalProgress);
  }, [state.activeBlocks, state.answeredQuestions, state.completedBlocks, state.dynamicBlocks]);

  // Controlla se un blocco è contrassegnato come completato
  const isBlockCompleted = useCallback((blockId: string): boolean => {
    return state.completedBlocks.includes(blockId);
  }, [state.completedBlocks]);

  // Contrassegna un blocco come completato
  const markBlockAsCompleted = useCallback((blockId: string) => {
    if (blockId && !state.completedBlocks.includes(blockId)) {
      console.log(`Marking block as completed: ${blockId}`);
      dispatch({ type: "MARK_BLOCK_COMPLETED", blockId });
    }
  }, [state.completedBlocks, dispatch]);

  return {
    setResponse,
    getResponse,
    addActiveBlock,
    removeActiveBlock,
    isQuestionAnswered,
    deleteQuestionResponses,
    getProgress,
    isBlockCompleted,
    markBlockAsCompleted
  };
};
