
import { useForm } from "@/contexts/FormContext";
import { useCallback } from "react";
import { cloneBlockForDynamicCreation } from "@/utils/blockUtils";
import { getChainOfInlineQuestions, getPreviousQuestion, getQuestionTextWithResponses } from "@/utils/formUtils";
import { Question } from "@/types/form";

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

  // Funzione per ottenere il testo della domanda precedente
  const getPreviousQuestionText = useCallback((questionId: string): string => {
    const prevQuestion = getPreviousQuestion(formContext.blocks, formContext.state.activeQuestion.block_id, questionId);
    if (!prevQuestion) return "";
    
    return getQuestionTextWithResponses(prevQuestion, formContext.state.responses);
  }, [formContext.blocks, formContext.state.activeQuestion.block_id, formContext.state.responses]);

  // Funzione per ottenere la domanda precedente
  const getPreviousQuestion = useCallback((questionId: string): Question | undefined => {
    return getPreviousQuestion(
      formContext.blocks, 
      formContext.state.activeQuestion.block_id, 
      questionId
    );
  }, [formContext.blocks, formContext.state.activeQuestion.block_id]);

  // Funzione per ottenere la catena di domande inline
  const getInlineQuestionChain = useCallback((blockId: string, questionId: string): Question[] => {
    return getChainOfInlineQuestions(
      formContext.blocks,
      blockId,
      questionId,
      false // Non includere la domanda corrente nella catena
    );
  }, [formContext.blocks]);

  // Ritorna le funzionalità estese insieme al context del form
  return {
    ...formContext,
    createAndNavigateToBlock,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain
  };
}
