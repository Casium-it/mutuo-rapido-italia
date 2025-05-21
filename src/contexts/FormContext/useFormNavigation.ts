
import { useContext, useCallback } from "react";
import { FormContext } from "./index";
import { useNavigate, useParams } from "react-router-dom";
import { NavigationHistory } from "@/types/form";

/**
 * Custom hook for form navigation functionality
 */
export const useFormNavigation = () => {
  const context = useContext(FormContext);
  const navigate = useNavigate();
  const params = useParams<{ blockType?: string }>();
  
  if (!context) {
    throw new Error("useFormNavigation must be used within a FormProvider");
  }
  
  const { state, blocks, dispatch } = context;
  
  const goToQuestion = useCallback((block_id: string, question_id: string, replace = false) => {
    const previousBlockId = state.activeQuestion.block_id;
    const previousQuestionId = state.activeQuestion.question_id;

    dispatch({ type: "GO_TO_QUESTION", block_id, question_id });
    
    dispatch({ 
      type: "ADD_NAVIGATION_HISTORY", 
      history: {
        from_block_id: previousBlockId,
        from_question_id: previousQuestionId,
        to_block_id: block_id,
        to_question_id: question_id,
        timestamp: Date.now()
      }
    });
    
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    const blockType = params.blockType || "funnel";
    const newPath = `/simulazione/${blockType}/${block_id}/${question_id}`;
    
    if (replace) {
      navigate(newPath, { replace: true });
    } else {
      navigate(newPath);
    }
    
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 300);
  }, [params.blockType, navigate, state.activeQuestion, dispatch]);

  const findQuestionById = useCallback((questionId: string) => {
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

  const navigateToNextQuestion = useCallback((currentQuestionId: string, leadsTo: string) => {
    const currentBlockId = state.activeQuestion.block_id;
    
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    if (leadsTo === "next_block") {
      let currentBlock = null;
      let currentBlockIndex = -1;
      
      const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
      
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
        
        const currentActiveIndex = activeBlocksWithPriority.findIndex(b => b!.block_id === currentBlock.block_id);
        
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
    } else {
      const found = findQuestionById(leadsTo);
      if (found) {
        dispatch({ 
          type: "ADD_NAVIGATION_HISTORY", 
          history: {
            from_block_id: currentBlockId,
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
  }, [blocks, state.activeBlocks, state.activeQuestion.block_id, state.dynamicBlocks, goToQuestion, findQuestionById, dispatch]);

  const getNavigationHistoryFor = useCallback((questionId: string): NavigationHistory | undefined => {
    const sortedHistory = [...state.navigationHistory].sort((a, b) => b.timestamp - a.timestamp);
    
    return sortedHistory.find(item => item.to_question_id === questionId);
  }, [state.navigationHistory]);
  
  return {
    goToQuestion,
    navigateToNextQuestion,
    getNavigationHistoryFor,
    findQuestionById
  };
};
