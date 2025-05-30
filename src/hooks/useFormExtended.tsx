import { useForm } from "@/contexts/FormContext";
import { Question, Block } from "@/types/form";

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
  const getPreviousQuestionText = (): string | null => {
    const navigationHistory = state.navigationHistory
      .filter(h => h.to_question_id === state.activeQuestion.question_id)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (navigationHistory.length === 0) return null;
    
    const lastNavigation = navigationHistory[0];
    const previousQuestion = findQuestionById(lastNavigation.from_question_id);
    
    return previousQuestion ? previousQuestion.question.question_text : null;
  };

  // Funzione per ottenere la domanda precedente
  const getPreviousQuestion = (): Question | null => {
    const navigationHistory = state.navigationHistory
      .filter(h => h.to_question_id === state.activeQuestion.question_id)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (navigationHistory.length === 0) return null;
    
    const lastNavigation = navigationHistory[0];
    const previousQuestion = findQuestionById(lastNavigation.from_question_id);
    
    return previousQuestion ? previousQuestion.question : null;
  };

  // Funzione per trovare una domanda per ID
  const findQuestionById = (questionId: string): { block: Block; question: Question } | null => {
    for (const block of blocks) {
      for (const question of block.questions) {
        if (question.question_id === questionId) {
          return { block, question };
        }
      }
    }
    return null;
  };

  // Funzione per ottenere la catena di domande inline
  const getInlineQuestionChain = (blockId: string, questionId: string): Question[] => {
    const currentBlock = blocks.find(b => b.block_id === blockId);
    if (!currentBlock) return [];
    
    const currentQuestionIndex = currentBlock.questions.findIndex(q => q.question_id === questionId);
    if (currentQuestionIndex === -1) return [];
    
    const chain: Question[] = [];
    
    // Vai indietro dal questionId corrente per trovare tutte le domande inline precedenti
    for (let i = currentQuestionIndex - 1; i >= 0; i--) {
      const question = currentBlock.questions[i];
      
      // Se la domanda è inline E è stata risposta, aggiungila alla catena
      if (question.inline === true && state.answeredQuestions.has(question.question_id)) {
        chain.unshift(question); // Aggiungi all'inizio per mantenere l'ordine
      } else {
        // Se la domanda non è inline o non è stata risposta, ferma la catena
        break;
      }
    }
    
    return chain;
  };

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
    getInlineQuestionChain
  };
};
