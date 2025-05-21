
import { useContext, useCallback } from "react";
import { FormContext } from "./index";

/**
 * Custom hook for block management in the form
 */
export const useFormBlocks = () => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error("useFormBlocks must be used within a FormProvider");
  }
  
  const { state, dispatch } = context;
  
  const addActiveBlock = useCallback((block_id: string) => {
    dispatch({ type: "ADD_ACTIVE_BLOCK", block_id });
  }, [dispatch]);

  const removeActiveBlock = useCallback((block_id: string) => {
    dispatch({ type: "REMOVE_ACTIVE_BLOCK", block_id });
  }, [dispatch]);
  
  const isBlockInvisible = useCallback((blockId: string): boolean => {
    const allBlocks = [...context.blocks, ...state.dynamicBlocks];
    const block = allBlocks.find(b => b.block_id === blockId);
    return !!block?.invisible;
  }, [context.blocks, state.dynamicBlocks]);

  return {
    addActiveBlock,
    removeActiveBlock,
    isBlockInvisible
  };
};
