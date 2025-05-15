
import React, { useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useParams } from "react-router-dom";
import { StandardBlock } from "@/types/form";

export function QuestionView() {
  const { state, blocks, goToQuestion } = useFormExtended();
  const location = useLocation();
  const params = useParams<{ blockId?: string, questionId?: string }>();
  
  // Sincronizza il componente con l'URL quando cambia
  useEffect(() => {
    if (params.blockId && params.questionId) {
      // Se l'URL contiene blockId e questionId, ma sono diversi dallo stato attuale,
      // aggiorna lo stato interno per allinearlo all'URL
      if (state.activeQuestion.block_id !== params.blockId || 
          state.activeQuestion.question_id !== params.questionId) {
        goToQuestion(params.blockId, params.questionId, true);
      }
    }
  }, [location.pathname, params.blockId, params.questionId, state.activeQuestion, goToQuestion]);
  
  // Find the current active block and question
  const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);
  
  // Verifica che il blocco sia un StandardBlock prima di cercare la domanda
  if (!activeBlock) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Blocco non trovato.</p>
      </div>
    );
  }

  // Se il blocco è un RepeatingGroupBlock, non dovremmo visualizzare questo componente
  if ('type' in activeBlock && activeBlock.type === 'repeating_group') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Questo blocco utilizza un componente personalizzato.</p>
      </div>
    );
  }

  // A questo punto sappiamo che è un StandardBlock
  const standardBlock = activeBlock as StandardBlock;
  const activeQuestion = standardBlock.questions.find(
    question => question.question_id === state.activeQuestion.question_id
  );

  if (!activeQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Domanda non trovata.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="space-y-4">
        <FormQuestion question={activeQuestion} />
      </div>
    </div>
  );
}
