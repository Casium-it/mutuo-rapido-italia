
import React, { useCallback } from "react";
import { useForm } from "@/contexts/FormContext";
import { Block, Question } from "@/types/form";

export const useFormExtended = () => {
  const {
    state,
    blocks,
    goToQuestion,
    setResponse,
    getResponse,
    addActiveBlock,
    removeActiveBlock,
    isQuestionAnswered,
    navigateToNextQuestion,
    getProgress,
    resetForm,
    getNavigationHistoryFor,
    createDynamicBlock,
    deleteDynamicBlock,
    deleteQuestionResponses,
    isBlockCompleted,
    markBlockAsCompleted,
    removeBlockFromCompleted,
    isQuestionPendingRemoval,
    setBackNavigation
  } = useForm();

  // Funzione per ottenere il testo della domanda precedente
  const getPreviousQuestionText = useCallback((questionId: string): string | null => {
    const history = getNavigationHistoryFor(questionId);
    if (!history) return null;

    const fromQuestionId = history.from_question_id;
    
    // Cerca la domanda in tutti i blocchi
    const allBlocks = [...blocks];
    
    for (const block of allBlocks) {
      for (const question of block.questions) {
        if (question.question_id === fromQuestionId) {
          return question.question_text;
        }
      }
    }
    
    return null;
  }, [blocks, getNavigationHistoryFor]);

  // Funzione per ottenere l'oggetto domanda precedente
  const getPreviousQuestion = useCallback((questionId: string): Question | null => {
    const history = getNavigationHistoryFor(questionId);
    if (!history) return null;

    const fromQuestionId = history.from_question_id;
    
    // Cerca la domanda in tutti i blocchi
    const allBlocks = [...blocks];
    
    for (const block of allBlocks) {
      for (const question of block.questions) {
        if (question.question_id === fromQuestionId) {
          return question;
        }
      }
    }
    
    return null;
  }, [blocks, getNavigationHistoryFor]);

  // Funzione per ottenere la catena di domande inline che precedono una domanda
  const getInlineQuestionChain = useCallback((blockId: string, questionId: string): Question[] => {
    // Trova il blocco
    const block = blocks.find(b => b.block_id === blockId);
    if (!block) return [];
    
    // Trova l'indice della domanda corrente
    const questionIndex = block.questions.findIndex(q => q.question_id === questionId);
    if (questionIndex <= 0) return []; // Se è la prima domanda o non trovata, non ci sono domande precedenti
    
    // Raccogli tutte le domande inline precedenti consecutive
    const inlineChain: Question[] = [];
    
    // Parti dalla domanda corrente e vai indietro
    for (let i = questionIndex - 1; i >= 0; i--) {
      const question = block.questions[i];
      
      // Se la domanda è inline, aggiungila alla catena
      if (question.inline === true) {
        // Aggiungi all'inizio per mantenere l'ordine corretto
        inlineChain.unshift(question);
      } else {
        // Se troviamo una domanda non inline, interrompiamo la catena
        break;
      }
    }
    
    return inlineChain;
  }, [blocks]);

  // Funzione per navigare a un blocco dinamico
  const navigateToDynamicBlock = useCallback((blockId: string) => {
    const block = blocks.find(b => b.block_id === blockId);
    if (block && block.questions.length > 0) {
      goToQuestion(blockId, block.questions[0].question_id);
    }
  }, [blocks, goToQuestion]);

  // Funzione per ottenere blocchi dinamici per blueprint
  const getDynamicBlocksByBlueprint = useCallback((blueprintId: string) => {
    return state.dynamicBlocks.filter(block => block.blueprint_id === blueprintId);
  }, [state.dynamicBlocks]);

  // Funzione per ottenere il riepilogo delle risposte di un blocco
  const getBlockResponseSummary = useCallback((blockId: string): string | null => {
    const block = blocks.find(b => b.block_id === blockId);
    if (!block) return null;

    const responses: string[] = [];
    
    for (const question of block.questions) {
      const response = getResponse(question.question_id);
      if (response) {
        for (const [key, value] of Object.entries(response)) {
          if (Array.isArray(value)) {
            responses.push(value.join(', '));
          } else {
            responses.push(value);
          }
        }
      }
    }
    
    return responses.length > 0 ? responses.join(' • ') : null;
  }, [blocks, getResponse]);

  // Funzione per verificare se un blocco dinamico è completo
  const isDynamicBlockComplete = useCallback((blockId: string): boolean => {
    return isBlockCompleted(blockId);
  }, [isBlockCompleted]);

  // Funzione per ottenere blocchi incompleti per blueprint
  const getIncompleteBlocks = useCallback((blueprintId?: string) => {
    if (blueprintId) {
      return getDynamicBlocksByBlueprint(blueprintId).filter(block => !isBlockCompleted(block.block_id));
    }
    return state.activeBlocks.filter(blockId => !isBlockCompleted(blockId));
  }, [getDynamicBlocksByBlueprint, isBlockCompleted, state.activeBlocks]);

  // Funzione per aggiungere una domanda alla lista di quelle in attesa di rimozione
  const addPendingRemoval = useCallback((questionId: string, blockId: string) => {
    // Implementazione da aggiungere
  }, []);

  // Funzione per rimuovere una domanda dalla lista di quelle in attesa di rimozione
  const removePendingRemoval = useCallback((questionId: string) => {
    // Implementazione da aggiungere
  }, []);

  return {
    state,
    blocks,
    goToQuestion,
    setResponse,
    getResponse,
    addActiveBlock,
    removeActiveBlock,
    isQuestionAnswered,
    navigateToNextQuestion,
    getProgress,
    resetForm,
    getNavigationHistoryFor,
    createDynamicBlock,
    deleteDynamicBlock,
    deleteQuestionResponses,
    isBlockCompleted,
    markBlockAsCompleted,
    removeBlockFromCompleted,
    isQuestionPendingRemoval,
    setBackNavigation,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    navigateToDynamicBlock,
    getDynamicBlocksByBlueprint,
    getBlockResponseSummary,
    isDynamicBlockComplete,
    getIncompleteBlocks,
    addPendingRemoval,
    removePendingRemoval
  };
};
