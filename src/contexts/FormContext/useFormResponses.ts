
import { useContext, useCallback } from "react";
import { FormContext } from "./index";
import { SelectPlaceholder } from "@/types/form";

/**
 * Custom hook for form response management
 */
export const useFormResponses = () => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error("useFormResponses must be used within a FormProvider");
  }
  
  const { state, blocks, dispatch } = context;
  
  const getResponse = useCallback((question_id: string, placeholder_key: string) => {
    if (!state.responses[question_id]) return undefined;
    return state.responses[question_id][placeholder_key];
  }, [state.responses]);
  
  const setResponse = useCallback((question_id: string, placeholder_key: string, value: string | string[]) => {
    const previousValue = state.responses[question_id]?.[placeholder_key];
    
    const allBlocks = [
      ...blocks,
      ...state.dynamicBlocks
    ];
    
    let questionObj = null;
    let foundBlock = null;
    
    for (const block of allBlocks) {
      const question = block.questions.find(q => q.question_id === question_id);
      if (question) {
        questionObj = question;
        foundBlock = block;
        break;
      }
    }
    
    if (questionObj && foundBlock && 
        questionObj.placeholders[placeholder_key] && 
        questionObj.placeholders[placeholder_key].type === "select") {
      
      const placeholder = questionObj.placeholders[placeholder_key] as SelectPlaceholder;
      
      if (previousValue && previousValue !== value) {
        if (typeof previousValue === 'string') {
          const prevOption = placeholder.options.find(opt => opt.id === previousValue);
          
          if (prevOption?.add_block) {
            let newOptionKeepsBlock = false;
            
            if (Array.isArray(value)) {
              newOptionKeepsBlock = value.some(optId => {
                const option = placeholder.options.find(opt => opt.id === optId);
                return option?.add_block === prevOption.add_block;
              });
            } else {
              const newOption = placeholder.options.find(opt => opt.id === value);
              newOptionKeepsBlock = newOption?.add_block === prevOption.add_block;
            }
            
            if (!newOptionKeepsBlock) {
              const blockToRemove = prevOption.add_block;
              const isDynamicBlock = state.dynamicBlocks.some(b => b.block_id === blockToRemove);
              
              // Handle both dynamic and static blocks
              if (isDynamicBlock) {
                dispatch({ type: "DELETE_DYNAMIC_BLOCK", blockId: blockToRemove });
              } else if (state.activeBlocks.includes(blockToRemove)) {
                // For static blocks, we just need to remove them from activeBlocks
                dispatch({ type: "REMOVE_ACTIVE_BLOCK", block_id: blockToRemove });
              }
            }
          }
        } else if (Array.isArray(previousValue) && Array.isArray(value)) {
          const removedOptionIds = previousValue.filter(id => !value.includes(id));
          
          removedOptionIds.forEach(optId => {
            const option = placeholder.options.find(opt => opt.id === optId);
            if (option?.add_block) {
              const blockStillNeeded = value.some(remainingId => {
                const remainingOpt = placeholder.options.find(opt => opt.id === remainingId);
                return remainingOpt?.add_block === option.add_block;
              });
              
              if (!blockStillNeeded) {
                const blockToRemove = option.add_block;
                const isDynamicBlock = state.dynamicBlocks.some(b => b.block_id === blockToRemove);
                
                // Handle both dynamic and static blocks
                if (isDynamicBlock) {
                  dispatch({ type: "DELETE_DYNAMIC_BLOCK", blockId: blockToRemove });
                } else if (state.activeBlocks.includes(blockToRemove)) {
                  dispatch({ type: "REMOVE_ACTIVE_BLOCK", block_id: blockToRemove });
                }
              }
            }
          });
        }
      }
    }
    
    dispatch({ type: "SET_RESPONSE", question_id, placeholder_key, value });
    dispatch({ type: "MARK_QUESTION_ANSWERED", question_id });
    
    // Check if the current response should add a block
    if (questionObj && questionObj.placeholders[placeholder_key].type === "select") {
      const placeholder = questionObj.placeholders[placeholder_key] as SelectPlaceholder;
      
      if (Array.isArray(value)) {
        // Handle multi-select
        value.forEach(optionId => {
          const option = placeholder.options.find(opt => opt.id === optionId);
          if (option?.add_block) {
            dispatch({ 
              type: "ADD_ACTIVE_BLOCK", 
              block_id: option.add_block,
              sourceQuestionId: question_id,
              sourcePlaceholderId: placeholder_key
            });
          }
        });
      } else {
        // Handle single-select
        const selectedOption = placeholder.options.find(opt => opt.id === value);
        if (selectedOption?.add_block) {
          dispatch({ 
            type: "ADD_ACTIVE_BLOCK", 
            block_id: selectedOption.add_block,
            sourceQuestionId: question_id,
            sourcePlaceholderId: placeholder_key
          });
        }
      }
    }
  }, [state.responses, state.dynamicBlocks, state.activeBlocks, blocks, dispatch]);
  
  const deleteQuestionResponses = useCallback((questionIds: string[]) => {
    if (!questionIds || questionIds.length === 0) return;
    dispatch({ type: "DELETE_QUESTION_RESPONSES", questionIds });
  }, [dispatch]);

  return {
    getResponse,
    setResponse,
    deleteQuestionResponses
  };
};
