
import { useContext } from "react";
import { FormContext } from "./index";

/**
 * Custom hook for accessing form state
 */
export const useFormState = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormState must be used within a FormProvider");
  }
  
  const { state, blocks, dispatch } = context;
  
  const getProgress = () => {
    let totalQuestions = 0;
    let answeredCount = 0;
    
    const allBlocks = [
      ...blocks,
      ...state.dynamicBlocks
    ];
    
    for (const blockId of state.activeBlocks) {
      const block = allBlocks.find(b => b.block_id === blockId);
      if (block) {
        totalQuestions += block.questions.length;
        
        block.questions.forEach(q => {
          if (state.answeredQuestions.has(q.question_id)) {
            answeredCount++;
          }
        });
      }
    }
    
    return totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  };
  
  const resetForm = () => {
    dispatch({ type: "RESET_FORM" });
  };
  
  const isQuestionAnswered = (question_id: string): boolean => {
    return state.answeredQuestions.has(question_id);
  };
  
  return {
    state,
    blocks,
    getProgress,
    resetForm,
    isQuestionAnswered,
    dispatch
  };
};
