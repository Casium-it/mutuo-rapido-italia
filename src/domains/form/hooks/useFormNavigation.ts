
import { useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Block, NavigationHistory, Question } from "@/types/form";
import { FormState, FormAction } from "../context/FormTypes";

type NavigationHookProps = {
  dispatch: React.Dispatch<FormAction>;
  state: FormState;
  blocks: Block[];
  findBlockByQuestionId: (questionId: string) => string | null;
  markBlockAsCompleted: (blockId: string) => void;
};

/**
 * Hook che gestisce la navigazione del form
 */
export const useFormNavigation = ({
  dispatch,
  state,
  blocks,
  findBlockByQuestionId,
  markBlockAsCompleted
}: NavigationHookProps) => {
  const navigate = useNavigate();
  const params = useParams<{ blockType?: string; blockId?: string; questionId?: string }>();
  const previousBlockIdRef = useRef<string | null>(null);
  const previousQuestionIdRef = useRef<string | null>(null);
  const usedNextBlockNavRef = useRef<boolean>(false);
  
  // Funzione per navigare a una domanda specifica
  const goToQuestion = useCallback((block_id: string, question_id: string, replace = false) => {
    // Imposta lo stato di navigazione a true
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    // Memorizza la domanda e il blocco correnti prima di cambiarli
    const fromBlockId = state.activeQuestion.block_id;
    const fromQuestionId = state.activeQuestion.question_id;

    // Aggiorna la domanda attiva
    dispatch({ type: "GO_TO_QUESTION", block_id, question_id });
    
    // Registra la cronologia di navigazione
    dispatch({ 
      type: "ADD_NAVIGATION_HISTORY", 
      history: {
        from_block_id: fromBlockId,
        from_question_id: fromQuestionId,
        to_block_id: block_id,
        to_question_id: question_id,
        timestamp: Date.now()
      }
    });
    
    // Gestisce la navigazione URL
    const blockType = params.blockType || "pensando";
    const newPath = `/simulazione/${blockType}/${block_id}/${question_id}`;
    
    if (replace) {
      navigate(newPath, { replace: true });
    } else {
      navigate(newPath);
    }
    
    // Imposta navigating a false dopo un breve ritardo per permettere il rendering
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 300);
  }, [params.blockType, navigate, state.activeQuestion, dispatch]);

  // Funzione per trovare una domanda tramite il suo ID
  const findQuestionById = useCallback((questionId: string): { block: Block; question: Question } | null => {
    const allBlocks = [
      ...blocks,
      ...state.dynamicBlocks
    ];
    
    for (const block of allBlocks) {
      for (const question of block.questions) {
        if (question.question_id === questionId) {
          return { block, question };
        }
      }
    }
    return null;
  }, [blocks, state.dynamicBlocks]);

  // Naviga alla domanda successiva
  const navigateToNextQuestion = useCallback((currentQuestionId: string, leadsTo: string) => {
    // Memorizza l'ID del blocco corrente prima dell'inizio della navigazione
    const sourceBlockId = state.activeQuestion.block_id;
    
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    // Controlla sia i casi "next_block" che "stop_flow" per impostare il flag
    if (leadsTo === "next_block") {
      // Imposta il flag che stiamo usando la navigazione "next_block"
      usedNextBlockNavRef.current = true;
      
      let currentBlock = null;
      let currentBlockIndex = -1;
      
      const sortedBlocks = blocks.sort((a, b) => a.priority - b.priority);
      
      for (let i = 0; i < sortedBlocks.length; i++) {
        const block = sortedBlocks[i];
        const hasQuestion = block.questions.some(q => q.question_id === currentQuestionId);
        if (hasQuestion) {
          currentBlockIndex = i;
          currentBlock = block;
          break;
        }
      }

      if (currentBlockIndex !== -1 && currentBlock) {
        let foundNextActiveBlock = false;
        
        const allBlocks = [
          ...sortedBlocks,
          ...state.dynamicBlocks
        ];
        
        const activeBlocksWithPriority = state.activeBlocks
          .map(blockId => allBlocks.find(b => b.block_id === blockId))
          .filter(Boolean)
          .filter(b => !b!.invisible)
          .sort((a, b) => a!.priority - b!.priority);
        
        const currentActiveIndex = activeBlocksWithPriority.findIndex(b => b!.block_id === currentBlock!.block_id);
        
        if (currentActiveIndex !== -1) {
          for (let i = currentActiveIndex + 1; i < activeBlocksWithPriority.length; i++) {
            const nextBlock = activeBlocksWithPriority[i];
            if (nextBlock && nextBlock.questions.length > 0) {
              foundNextActiveBlock = true;
              goToQuestion(nextBlock.block_id, nextBlock.questions[0].question_id);
              break;
            }
          }
        }
        
        if (!foundNextActiveBlock) {
          const currentQuestionIndex = currentBlock.questions.findIndex(q => q.question_id === currentQuestionId);
          
          if (currentQuestionIndex < currentBlock.questions.length - 1) {
            const nextQuestion = currentBlock.questions[currentQuestionIndex + 1];
            goToQuestion(currentBlock.block_id, nextQuestion.question_id);
            return;
          }
        }
      }
    } else if (leadsTo === "stop_flow") {
      // Imposta anche il flag per stop_flow per contrassegnare il blocco come completato
      usedNextBlockNavRef.current = true;
      
      // Imposta un flag che QuestionView controllerà per visualizzare il messaggio di stop flow
      sessionStorage.setItem("stopFlowActivated", "true");
      
      // Non navighiamo a un'altra domanda nel caso di stop_flow
      setTimeout(() => {
        dispatch({ type: "SET_NAVIGATING", isNavigating: false });
      }, 300);
      return;
    } else {
      // Per la navigazione diretta alla domanda (non next_block o stop_flow), imposta il flag a false
      usedNextBlockNavRef.current = false;
      
      const found = findQuestionById(leadsTo);
      if (found) {
        dispatch({ 
          type: "ADD_NAVIGATION_HISTORY", 
          history: {
            from_block_id: sourceBlockId,
            from_question_id: currentQuestionId,
            to_block_id: found.block.block_id,
            to_question_id: found.question.question_id,
            timestamp: Date.now()
          }
        });
        
        goToQuestion(found.block.block_id, found.question.question_id);
      }
    }
    
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 300);
  }, [blocks, state.activeBlocks, state.activeQuestion.block_id, state.dynamicBlocks, dispatch, findQuestionById, goToQuestion]);

  // Ottiene la cronologia di navigazione per una domanda specifica
  const getNavigationHistoryFor = useCallback((questionId: string): NavigationHistory | undefined => {
    const sortedHistory = [...state.navigationHistory].sort((a, b) => b.timestamp - a.timestamp);
    
    return sortedHistory.find(item => item.to_question_id === questionId);
  }, [state.navigationHistory]);

  // Ottenere i riferimenti per poterli usare in altri hook
  const getNavigationRefs = useCallback(() => ({
    previousBlockIdRef,
    previousQuestionIdRef,
    usedNextBlockNavRef
  }), []);

  return {
    goToQuestion,
    navigateToNextQuestion,
    getNavigationHistoryFor,
    getNavigationRefs
  };
};
