
import React, { useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useParams } from "react-router-dom";

export function QuestionView() {
  const { state, blocks, goToQuestion, isQuestionRepeatable, getCurrentIterationId } = useFormExtended();
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
  
  // Verifica se la domanda è ripetibile
  const isRepeatable = isQuestionRepeatable(activeQuestion.question_id);
  
  // Ottieni l'ID dell'iterazione corrente se la domanda è ripetibile
  const iterationId = isRepeatable ? getCurrentIterationId(activeQuestion.question_id) : 1;

  return (
    <div className="max-w-2xl">
      <div className="space-y-4">
        {/* Se la domanda è ripetibile, mostra l'indicazione dell'iterazione corrente */}
        {isRepeatable && iterationId > 1 && (
          <div className="flex items-center justify-center mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Elemento {iterationId}
            </span>
          </div>
        )}
        <FormQuestion question={activeQuestion} />
      </div>
    </div>
  );
}
