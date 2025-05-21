
import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Block, NavigationHistory } from "@/types/form";
import { FormState, FormAction } from "../context/FormTypes";

type NavigationHookProps = {
  dispatch: React.Dispatch<FormAction>;
  state: FormState;
  blocks: Block[];
  findBlockByQuestionId: (questionId: string) => string | null;
  markBlockAsCompleted: (blockId: string) => void;
};

/**
 * Hook per la gestione della navigazione del form
 */
export const useFormNavigation = ({
  dispatch,
  state,
  blocks,
  findBlockByQuestionId,
  markBlockAsCompleted
}: NavigationHookProps) => {
  const navigate = useNavigate();
  
  // References per tracciare lo stato di navigazione
  const previousBlockIdRef = useRef<string | boolean>(false);
  const previousQuestionIdRef = useRef<string>("");
  const usedNextBlockNavRef = useRef<boolean>(false);
  
  const goToQuestion = useCallback((block_id: string, question_id: string, replace: boolean = false) => {
    // Aggiungi alla cronologia di navigazione
    if (state.activeQuestion.block_id && 
        state.activeQuestion.question_id && 
        !state.isNavigating) {
      const historyEntry: NavigationHistory = {
        from_block_id: state.activeQuestion.block_id,
        from_question_id: state.activeQuestion.question_id,
        to_block_id: block_id,
        to_question_id: question_id,
        timestamp: Date.now()
      };
      
      dispatch({ type: "ADD_NAVIGATION_HISTORY", history: historyEntry });
    }
    
    // Imposta lo stato di navigazione su true
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    // Trova il tipo di blocco dai parametri dell'URL
    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    const blockType = parts[2] || 'pensando';
    
    // Naviga alla nuova URL
    const path = `/simulazione/${blockType}/${block_id}/${question_id}`;
    
    if (replace) {
      navigate(path, { replace: true });
    } else {
      navigate(path);
    }
    
    // Aggiorna lo stato attivo
    dispatch({ type: "GO_TO_QUESTION", block_id, question_id });
    
    // Aggiungi il blocco agli attivi se non è già presente
    if (!state.activeBlocks.includes(block_id)) {
      dispatch({ type: "ADD_ACTIVE_BLOCK", block_id });
    }
    
    // Imposta lo stato di navigazione su false dopo un breve ritardo
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 100);
  }, [state.activeQuestion, state.activeBlocks, state.isNavigating, dispatch, navigate]);

  // Navigazione alla domanda successiva basata su leads_to
  const navigateToNextQuestion = useCallback((currentQuestionId: string, leadsTo: string) => {
    // Imposta il flag per la navigazione "next_block"
    if (leadsTo === "next_block") {
      usedNextBlockNavRef.current = true;
    } else {
      usedNextBlockNavRef.current = false;
    }
    
    // Ottieni il blocco corrente
    const currentBlockId = findBlockByQuestionId(currentQuestionId);
    
    if (!currentBlockId) {
      console.error(`Impossibile trovare il blocco per la domanda ${currentQuestionId}`);
      return;
    }
    
    // Trova il blocco e la domanda
    const currentBlock = [...blocks, ...state.dynamicBlocks].find(
      block => block.block_id === currentBlockId
    );
    
    if (!currentBlock) {
      console.error(`Blocco ${currentBlockId} non trovato`);
      return;
    }
    
    // Trova la domanda corrente
    const currentQuestion = currentBlock.questions.find(
      q => q.question_id === currentQuestionId
    );
    
    if (!currentQuestion) {
      console.error(`Domanda ${currentQuestionId} non trovata nel blocco ${currentBlockId}`);
      return;
    }
    
    // Speciale handling per leads_to "next_block"
    if (leadsTo === "next_block") {
      // Trova il prossimo blocco attivo basato sulla priorità
      const sortedActiveBlocks = [...state.activeBlocks]
        .map(blockId => [...blocks, ...state.dynamicBlocks].find(b => b.block_id === blockId))
        .filter(block => block !== undefined)
        .sort((a, b) => (a!.priority - b!.priority)) as Block[];
      
      const currentBlockIndex = sortedActiveBlocks.findIndex(b => b.block_id === currentBlockId);
      
      if (currentBlockIndex >= 0 && currentBlockIndex < sortedActiveBlocks.length - 1) {
        const nextBlock = sortedActiveBlocks[currentBlockIndex + 1];
        
        if (nextBlock && nextBlock.questions.length > 0) {
          const nextQuestion = nextBlock.questions[0];
          goToQuestion(nextBlock.block_id, nextQuestion.question_id);
          return;
        }
      } else {
        // Se è l'ultimo blocco, vai alla pagina di completamento
        navigate("/simulazione/completato");
        return;
      }
    } else if (leadsTo === "stop_flow") {
      // Imposta un flag in sessionStorage per mostrare un avviso
      sessionStorage.setItem("stopFlowActivated", "true");
      // Torna alla stessa domanda
      goToQuestion(currentBlockId, currentQuestionId);
      return;
    } else if (leadsTo === "completed") {
      // Vai alla pagina di completamento
      navigate("/simulazione/completato");
      return;
    } else {
      // Caso standard - naviga alla domanda specificata
      const targetBlockId = findBlockByQuestionId(leadsTo);
      
      if (!targetBlockId) {
        console.error(`Impossible trovare il blocco per la domanda di destinazione ${leadsTo}`);
        return;
      }
      
      goToQuestion(targetBlockId, leadsTo);
    }
  }, [blocks, state.dynamicBlocks, state.activeBlocks, findBlockByQuestionId, goToQuestion, navigate]);

  // Ottenere la cronologia di navigazione per una domanda specifica
  const getNavigationHistoryFor = useCallback((questionId: string): NavigationHistory | undefined => {
    if (!questionId) return undefined;
    
    const relevantHistory = state.navigationHistory.filter(item => 
      item.to_question_id === questionId
    );
    
    if (relevantHistory.length === 0) return undefined;
    
    // Ordina per timestamp, più recente prima
    relevantHistory.sort((a, b) => b.timestamp - a.timestamp);
    return relevantHistory[0];
  }, [state.navigationHistory]);

  // Funzione per esporre i riferimenti di navigazione
  const getNavigationRefs = useCallback(() => {
    return {
      previousBlockIdRef,
      previousQuestionIdRef,
      usedNextBlockNavRef
    };
  }, []);

  return {
    goToQuestion,
    navigateToNextQuestion,
    getNavigationHistoryFor,
    getNavigationRefs
  };
};
