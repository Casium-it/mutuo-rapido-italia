
import { useContext, useCallback } from "react";
import { FormContext } from "./index";
import { Block } from "@/types/form";
import { ensureBlockHasPriority } from "@/utils/blockUtils";

/**
 * Custom hook for dynamic block management
 */
export const useFormDynamicBlocks = () => {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error("useFormDynamicBlocks must be used within a FormProvider");
  }
  
  const { state, blocks, dispatch } = context;
  
  const createDynamicBlock = useCallback((blockBlueprintId: string): string | null => {
    console.log(`Creazione blocco dinamico dal blueprint: ${blockBlueprintId}`);
    
    const blueprintBlock = blocks.find(b => b.block_id === blockBlueprintId && b.multiBlock === true);
    
    if (!blueprintBlock) {
      console.error(`Blueprint block ${blockBlueprintId} not found or is not a multiBlock`);
      return null;
    }
    
    const existingCopies = state.dynamicBlocks
      .filter(block => block.blueprint_id === blockBlueprintId)
      .map(block => block.copy_number || 0);
    
    const nextCopyNumber = existingCopies.length > 0 ? Math.max(...existingCopies) + 1 : 1;
    
    const newBlockId = blockBlueprintId.includes('{copyNumber}') ? 
      blockBlueprintId.replace('{copyNumber}', nextCopyNumber.toString()) : 
      `${blockBlueprintId}${nextCopyNumber}`;
    
    const newBlock: Block = {
      ...JSON.parse(JSON.stringify(blueprintBlock)),
      block_id: newBlockId,
      blueprint_id: blockBlueprintId,
      copy_number: nextCopyNumber,
      title: `${blueprintBlock.title} ${nextCopyNumber}`,
    };
    
    newBlock.questions = newBlock.questions.map(question => {
      const updatedQuestion = {
        ...question,
        question_id: question.question_id.replace('{copyNumber}', nextCopyNumber.toString())
      };
      
      for (const placeholderKey in updatedQuestion.placeholders) {
        const placeholder = updatedQuestion.placeholders[placeholderKey];
        
        if (placeholder.type === "select") {
          placeholder.options = placeholder.options.map(option => ({
            ...option,
            leads_to: option.leads_to.replace('{copyNumber}', nextCopyNumber.toString())
          }));
        }
        
        if (placeholder.type === "input" && placeholder.leads_to) {
          placeholder.leads_to = placeholder.leads_to.replace('{copyNumber}', nextCopyNumber.toString());
        }
        
        if (placeholder.type === "MultiBlockManager" && placeholder.leads_to) {
          placeholder.leads_to = placeholder.leads_to.replace('{copyNumber}', nextCopyNumber.toString());
        }
      }
      
      return updatedQuestion;
    });
    
    const blockWithPriority = ensureBlockHasPriority(newBlock);
    
    dispatch({ type: "ADD_DYNAMIC_BLOCK", block: blockWithPriority });
    
    return newBlockId;
  }, [blocks, state.dynamicBlocks, dispatch]);
  
  const deleteDynamicBlock = useCallback((blockId: string): boolean => {
    try {
      const blockExists = state.dynamicBlocks.some(b => b.block_id === blockId);
      
      if (!blockExists) {
        console.error(`Il blocco dinamico ${blockId} non esiste`);
        return false;
      }
      
      dispatch({ type: "DELETE_DYNAMIC_BLOCK", blockId });
      return true;
    } catch (error) {
      console.error("Errore nell'eliminazione del blocco dinamico:", error);
      return false;
    }
  }, [state.dynamicBlocks, dispatch]);
  
  const navigateToDynamicBlock = useCallback((blockId: string): boolean => {
    // Trova il blocco dinamico per ID
    const dynamicBlock = state.dynamicBlocks.find(b => b.block_id === blockId);
    
    if (!dynamicBlock || dynamicBlock.questions.length === 0) {
      console.error("Blocco dinamico non trovato o senza domande:", blockId);
      return false;
    }
    
    const firstQuestionId = dynamicBlock.questions[0].question_id;
    console.log(`Navigazione al blocco: ${blockId}, domanda: ${firstQuestionId}`);
    
    // Utilizziamo il contesto di navigazione che abbiamo creato
    const { goToQuestion } = context;
    goToQuestion(blockId, firstQuestionId);
    
    return true;
  }, [state.dynamicBlocks, context]);
  
  const getDynamicBlocksByBlueprint = useCallback((blueprintId: string): Block[] => {
    if (!blueprintId) return [];
    
    const dynamicBlueprintPattern = blueprintId.includes("{copyNumber}") ? 
      blueprintId : 
      `${blueprintId}{copyNumber}`;
      
    return state.dynamicBlocks.filter(block => 
      block.blueprint_id === blueprintId || 
      block.blueprint_id === dynamicBlueprintPattern
    );
  }, [state.dynamicBlocks]);
  
  return {
    createDynamicBlock,
    deleteDynamicBlock,
    navigateToDynamicBlock,
    getDynamicBlocksByBlueprint
  };
};
