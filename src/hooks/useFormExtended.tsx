
import { useForm } from "@/contexts/FormContext";
import { useCallback } from "react";
import { Block, Question } from "@/types/form";

export function useFormExtended() {
  const formContext = useForm();
  
  // Helper per ottenere il testo più descrittivo delle risposte a un blocco
  const getBlockResponseSummary = useCallback(
    (blockId: string): string | null => {
      const blockResponses = formContext.state.responses;
      if (!blockResponses) return null;
      
      const allBlocks = [
        ...formContext.blocks
      ];
      
      const block = allBlocks.find(b => b.block_id === blockId);
      if (!block) return null;
      
      let summary = "";
      
      block.questions.forEach(question => {
        if (blockResponses[question.question_id]) {
          Object.entries(blockResponses[question.question_id]).forEach(
            ([placeholderKey, value]) => {
              const placeholder = question.placeholders[placeholderKey];
              
              if (placeholder?.type === "select") {
                if (Array.isArray(value)) {
                  value.forEach(val => {
                    const option = placeholder.options.find(o => o.id === val);
                    if (option) {
                      summary += `<div><b>${placeholder.label || placeholder.placeholder_label || "Opzione"}:</b> ${option.label}</div>`;
                    }
                  });
                } else {
                  const option = placeholder.options.find(o => o.id === value);
                  if (option) {
                    summary += `<div><b>${placeholder.label || placeholder.placeholder_label || "Opzione"}:</b> ${option.label}</div>`;
                  }
                }
              } else if (placeholder?.type === "input") {
                summary += `<div><b>${placeholder.placeholder_label}:</b> ${value}</div>`;
              }
            }
          );
        }
      });
      
      return summary === "" ? null : summary;
    },
    [formContext.state.responses, formContext.blocks]
  );
  
  // Ottieni tutti i blocchi dinamici basati su un blueprint
  const getDynamicBlocksByBlueprint = useCallback(
    (blueprintId: string): Block[] => {
      return formContext.state.dynamicBlocks.filter(
        block => block.blueprint_id === blueprintId
      );
    },
    [formContext.state.dynamicBlocks]
  );
  
  // Trova il blocco che contiene la domanda specificata
  const findBlockByQuestionId = useCallback(
    (questionId: string): string | null => {
      // Prima cerca nei blocchi statici
      for (const block of formContext.blocks) {
        if (block.questions.some(q => q.question_id === questionId)) {
          return block.block_id;
        }
      }
      // Poi cerca nei blocchi dinamici
      for (const block of formContext.state.dynamicBlocks) {
        if (block.questions.some(q => q.question_id === questionId)) {
          return block.block_id;
        }
      }
      return null;
    },
    [formContext.blocks, formContext.state.dynamicBlocks]
  );
  
  // Funzioni mancanti per la gestione delle catene di domande
  
  // Ottieni il testo della domanda precedente
  const getPreviousQuestionText = useCallback(
    (blockId: string, questionId: string): string | null => {
      const block = [...formContext.blocks, ...formContext.state.dynamicBlocks].find(
        b => b.block_id === blockId
      );
      
      if (!block) return null;
      
      // Trova l'indice della domanda corrente
      const currentQuestionIndex = block.questions.findIndex(q => q.question_id === questionId);
      
      // Se non c'è una domanda precedente, restituisci null
      if (currentQuestionIndex <= 0) return null;
      
      // Restituisci il testo della domanda precedente
      return block.questions[currentQuestionIndex - 1].question_text;
    },
    [formContext.blocks, formContext.state.dynamicBlocks]
  );
  
  // Ottieni l'intero oggetto domanda precedente
  const getPreviousQuestion = useCallback(
    (blockId: string, questionId: string): Question | null => {
      const block = [...formContext.blocks, ...formContext.state.dynamicBlocks].find(
        b => b.block_id === blockId
      );
      
      if (!block) return null;
      
      // Trova l'indice della domanda corrente
      const currentQuestionIndex = block.questions.findIndex(q => q.question_id === questionId);
      
      // Se non c'è una domanda precedente, restituisci null
      if (currentQuestionIndex <= 0) return null;
      
      // Restituisci la domanda precedente
      return block.questions[currentQuestionIndex - 1];
    },
    [formContext.blocks, formContext.state.dynamicBlocks]
  );
  
  // Ottieni la catena di domande inline che porta alla domanda corrente
  const getInlineQuestionChain = useCallback(
    (blockId: string, questionId: string): Question[] => {
      const block = [...formContext.blocks, ...formContext.state.dynamicBlocks].find(
        b => b.block_id === blockId
      );
      
      if (!block) return [];
      
      // Trova l'indice della domanda corrente
      const currentQuestionIndex = block.questions.findIndex(q => q.question_id === questionId);
      
      if (currentQuestionIndex <= 0) return [];
      
      // Costruisci la catena di domande inline
      const chain: Question[] = [];
      
      // Parti dalla prima domanda non inline del blocco
      let firstNonInlineIndex = 0;
      for (let i = currentQuestionIndex - 1; i >= 0; i--) {
        if (!block.questions[i].inline) {
          firstNonInlineIndex = i;
          break;
        }
      }
      
      // Aggiungi la prima domanda non inline
      chain.push(block.questions[firstNonInlineIndex]);
      
      // Aggiungi le domande inline che seguono fino alla domanda corrente (esclusa)
      for (let i = firstNonInlineIndex + 1; i < currentQuestionIndex; i++) {
        if (block.questions[i].inline) {
          chain.push(block.questions[i]);
        } else {
          // Se troviamo una domanda non inline, ricominciamo la catena
          chain.length = 0;
          chain.push(block.questions[i]);
        }
      }
      
      return chain;
    },
    [formContext.blocks, formContext.state.dynamicBlocks]
  );
  
  // Funzione per navigare a un blocco dinamico specifico
  const navigateToDynamicBlock = useCallback(
    (blockId: string) => {
      const block = formContext.state.dynamicBlocks.find(b => b.block_id === blockId);
      
      if (!block || block.questions.length === 0) return;
      
      // Naviga alla prima domanda del blocco
      formContext.goToQuestion(blockId, block.questions[0].question_id);
    },
    [formContext.state.dynamicBlocks, formContext.goToQuestion]
  );
  
  // Aggiorniamo i tipi per QuestionView.tsx
  return {
    ...formContext,
    getBlockResponseSummary,
    getDynamicBlocksByBlueprint,
    findBlockByQuestionId,
    getPreviousQuestionText,
    getPreviousQuestion,
    getInlineQuestionChain,
    navigateToDynamicBlock
  };
}
