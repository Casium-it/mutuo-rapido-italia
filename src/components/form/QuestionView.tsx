
import React, { useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useParams } from "react-router-dom";

export function QuestionView() {
  const { state, blocks, goToQuestion } = useFormExtended();
  const location = useLocation();
  const params = useParams<{ blockId?: string, questionId?: string }>();
  
  // Sincronizza il componente con l'URL quando cambia, evitando cicli infiniti
  useEffect(() => {
    if (params.blockId && params.questionId) {
      // Solo se l'URL contiene blockId e questionId, e sono diversi dallo stato attuale
      if (state.activeQuestion.block_id !== params.blockId || 
          state.activeQuestion.question_id !== params.questionId) {
        
        // Usa replace=true per evitare di aggiungere un'entry alla history
        // e riduci le chiamate sostituendo invece di aggiungere alla cronologia
        goToQuestion(params.blockId, params.questionId, true);
      }
    }
  // Rimuoviamo state.activeQuestion dalle dipendenze per evitare cicli
  }, [location.pathname, params.blockId, params.questionId, goToQuestion]);
  
  // Find the current active block and question
  const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);
  const activeQuestion = activeBlock?.questions.find(
    question => question.question_id === state.activeQuestion.question_id
  );

  if (!activeBlock || !activeQuestion) {
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
