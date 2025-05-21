
import { useForm } from "@/contexts/FormContext";
import { Block } from "@/types/form";

/**
 * Hook per gestire i blocchi del form e le loro caratteristiche
 */
export const useFormBlocks = () => {
  const formContext = useForm();

  /**
   * Checks if a block is invisible
   * @param blockId Block ID
   * @returns True if the block is invisible, false otherwise
   */
  const isBlockInvisible = (blockId: string): boolean => {
    const block = formContext.blocks.find(b => b.block_id === blockId);
    return !!block?.invisible;
  };

  /**
   * Creates a dynamic block based on a blueprint without navigating to it
   * @param blockBlueprintId The ID of the block blueprint to use
   * @returns The ID of the created block or null if creation failed
   */
  const createDynamicBlock = (blockBlueprintId: string): string | null => {
    console.log(`Creazione blocco dinamico dal blueprint: ${blockBlueprintId}`);
    
    try {
      // Create the dynamic block
      const newBlockId = formContext.createDynamicBlock(blockBlueprintId);
      console.log(`Nuovo blocco creato con ID: ${newBlockId}`);
      
      return newBlockId;
    } catch (error) {
      console.error("Errore nella creazione del blocco dinamico:", error);
      return null;
    }
  };

  /**
   * Delete a specific dynamic block
   * @param blockId The ID of the dynamic block to delete
   */
  const deleteDynamicBlock = (blockId: string): boolean => {
    return formContext.deleteDynamicBlock(blockId);
  };

  /**
   * Remove a block from active blocks
   * @param blockId The ID of the block to remove
   */
  const removeActiveBlock = (blockId: string): void => {
    return formContext.removeActiveBlock(blockId);
  };

  /**
   * Add a block to active blocks
   * @param blockId The ID of the block to add
   */
  const addActiveBlock = (blockId: string): void => {
    return formContext.addActiveBlock(blockId);
  };

  /**
   * Get all dynamic blocks of a specific blueprint type
   * @param blueprintId The blueprint ID to filter by
   * @returns Array of dynamic blocks matching the blueprint type
   */
  const getDynamicBlocksByBlueprint = (blueprintId: string): Block[] => {
    if (!blueprintId) return [];
    
    const dynamicBlueprint = blueprintId.includes("{copyNumber}") ? 
      blueprintId : 
      `${blueprintId}{copyNumber}`;
      
    return formContext.state.dynamicBlocks
      .filter(block => block.blueprint_id === blueprintId || 
                       block.blueprint_id === dynamicBlueprint);
  };

  /**
   * Creates a dynamic block based on a blueprint and optionally navigates to it
   * @param blockBlueprintId The ID of the block blueprint to use
   * @param navigateToBlock Whether to navigate to the new block after creation
   * @returns The ID of the created block or null if creation failed
   */
  const createAndNavigateToBlock = (blockBlueprintId: string, navigateToBlock: boolean = false): string | null => {
    console.log(`Creazione blocco dinamico dal blueprint: ${blockBlueprintId}`);
    
    try {
      // Create the dynamic block
      const newBlockId = formContext.createDynamicBlock(blockBlueprintId);
      console.log(`Nuovo blocco creato con ID: ${newBlockId}`);
      
      if (newBlockId && navigateToBlock) {
        const dynamicBlock = formContext.state.dynamicBlocks.find(b => b.block_id === newBlockId);
        
        if (!dynamicBlock || dynamicBlock.questions.length === 0) {
          console.error("Blocco dinamico non trovato o senza domande:", newBlockId);
          return newBlockId;
        }
        
        const firstQuestionId = dynamicBlock.questions[0].question_id;
        console.log(`Navigazione al blocco: ${newBlockId}, domanda: ${firstQuestionId}`);
        formContext.goToQuestion(newBlockId, firstQuestionId);
      }
      
      return newBlockId;
    } catch (error) {
      console.error("Errore nella creazione del blocco dinamico:", error);
      return null;
    }
  };

  // For compatibility, provide a dummy implementation that always returns true
  const areAllDynamicBlocksComplete = (): boolean => {
    return true;
  };

  // Check if a block has been completed
  const isBlockCompleted = (blockId: string): boolean => {
    const block = formContext.blocks.find(b => b.block_id === blockId);
    if (!block) return false;
    
    // Un blocco è completato se tutte le sue domande sono state risposte
    return block.questions.every(question => 
      formContext.isQuestionAnswered(question.question_id)
    );
  };

  return {
    isBlockInvisible,
    createDynamicBlock,
    deleteDynamicBlock,
    removeActiveBlock,
    addActiveBlock,
    getDynamicBlocksByBlueprint,
    areAllDynamicBlocksComplete,
    createAndNavigateToBlock,
    isBlockCompleted,
    blocks: formContext.blocks,
  };
};
