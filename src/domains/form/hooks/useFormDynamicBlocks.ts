
import { useCallback } from "react";
import { Block } from "@/types/form";
import { FormState, FormAction } from "../context/FormTypes";
import { ensureBlockHasPriority } from "@/utils/blockUtils";

type DynamicBlocksHookProps = {
  dispatch: React.Dispatch<FormAction>;
  state: FormState;
  blocks: Block[];
};

/**
 * Hook per la gestione dei blocchi dinamici
 */
export const useFormDynamicBlocks = ({
  dispatch,
  state,
  blocks
}: DynamicBlocksHookProps) => {
  // Crea un blocco dinamico basato su un blueprint
  const createDynamicBlock = useCallback((blockBlueprintId: string): string | null => {
    const blueprintBlock = blocks.find(b => b.block_id === blockBlueprintId && b.multiBlock === true);
    
    if (!blueprintBlock) {
      console.error(`Blueprint block ${blockBlueprintId} not found or is not a multiBlock`);
      return null;
    }
    
    const existingCopies = state.dynamicBlocks
      .filter(block => block.blueprint_id === blockBlueprintId)
      .map(block => block.copy_number || 0);
    
    const nextCopyNumber = existingCopies.length > 0 ? Math.max(...existingCopies) + 1 : 1;
    
    const newBlockId = blockBlueprintId.includes('{copyNumber}')
      ? blockBlueprintId.replace('{copyNumber}', nextCopyNumber.toString())
      : `${blockBlueprintId}${nextCopyNumber}`;
    
    const newBlock: Block = {
      ...JSON.parse(JSON.stringify(blueprintBlock)),
      block_id: newBlockId,
      blueprint_id: blockBlueprintId,
      copy_number: nextCopyNumber,
      title: `${blueprintBlock.title} ${nextCopyNumber}`,
    };
    
    // Aggiorna gli ID delle domande e i percorsi di navigazione
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
    
    // Assicura che il blocco abbia una priorità
    const blockWithPriority = ensureBlockHasPriority(newBlock);
    
    // Aggiungi il blocco dinamico allo stato
    dispatch({ type: "ADD_DYNAMIC_BLOCK", block: blockWithPriority });
    
    return newBlockId;
  }, [blocks, state.dynamicBlocks, dispatch]);

  // Elimina un blocco dinamico
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

  // Ottieni tutti i blocchi dinamici di un tipo specifico di blueprint
  const getDynamicBlocksByBlueprint = useCallback((blueprintId: string): Block[] => {
    if (!blueprintId) return [];
    
    const dynamicBlueprint = blueprintId.includes("{copyNumber}") ? 
      blueprintId : 
      `${blueprintId}{copyNumber}`;
      
    return state.dynamicBlocks
      .filter(block => block.blueprint_id === blueprintId || 
                      block.blueprint_id === dynamicBlueprint);
  }, [state.dynamicBlocks]);

  // Crea un blocco dinamico e naviga ad esso (per essere usato in useFormExtended)
  const createAndNavigateToBlock = useCallback((blockBlueprintId: string, navigateToBlock: boolean = false): string | null => {
    console.log(`Creazione blocco dinamico dal blueprint: ${blockBlueprintId}`);
    
    try {
      // Crea il blocco dinamico
      const newBlockId = createDynamicBlock(blockBlueprintId);
      console.log(`Nuovo blocco creato con ID: ${newBlockId}`);
      
      return newBlockId;
    } catch (error) {
      console.error("Errore nella creazione del blocco dinamico:", error);
      return null;
    }
  }, [createDynamicBlock]);

  return {
    createDynamicBlock,
    deleteDynamicBlock,
    getDynamicBlocksByBlueprint,
    createAndNavigateToBlock
  };
};
