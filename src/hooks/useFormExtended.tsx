import { useForm } from "@/contexts/FormContext";
import { useCallback } from "react";
import { Block } from "@/types/form";

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
                      summary += `<div><b>${placeholder.label}:</b> ${option.label}</div>`;
                    }
                  });
                } else {
                  const option = placeholder.options.find(o => o.id === value);
                  if (option) {
                    summary += `<div><b>${placeholder.label}:</b> ${option.label}</div>`;
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
  
  // Aggiorniamo i tipi per QuestionView.tsx
  return {
    ...formContext,
    getBlockResponseSummary,
    getDynamicBlocksByBlueprint,
    findBlockByQuestionId
  };
}
