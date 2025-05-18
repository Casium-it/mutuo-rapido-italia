
import { useForm } from "@/contexts/FormContext";
import { useCallback } from "react";
import { cloneBlockForDynamicCreation } from "@/utils/blockUtils";

export function useFormExtended() {
  const formContext = useForm();

  // Funzione per creare un blocco dinamico basato su un blueprint e navigare ad esso
  const createAndNavigateToBlock = useCallback((blockBlueprintId: string, navigateToFirst: boolean = true) => {
    console.log(`Creating dynamic block from blueprint: ${blockBlueprintId}`);
    
    // Crea il blocco dinamico
    const newBlockId = formContext.createDynamicBlock(blockBlueprintId);
    console.log(`Created new block with ID: ${newBlockId}`);
    
    if (newBlockId && navigateToFirst) {
      // Trova il blocco creato tra tutti i blocchi disponibili
      const createdBlock = formContext.blocks.find(block => block.block_id === newBlockId);
      
      if (createdBlock && createdBlock.questions.length > 0) {
        // Naviga alla prima domanda del nuovo blocco
        const firstQuestionId = createdBlock.questions[0].question_id;
        console.log(`Navigating to first question: ${firstQuestionId} in block: ${newBlockId}`);
        formContext.goToQuestion(newBlockId, firstQuestionId, true);
      } else {
        console.error(`Blocco creato ${newBlockId} non trovato o senza domande`);
      }
    }
    
    return newBlockId;
  }, [formContext]);

  // Ritorna le funzionalità estese insieme al context del form
  return {
    ...formContext,
    createAndNavigateToBlock
  };
}
