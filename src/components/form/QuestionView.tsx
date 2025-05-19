
import React, { useEffect, useRef } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useParams } from "react-router-dom";

export function QuestionView() {
  const { state, blocks, goToQuestion } = useFormExtended();
  const location = useLocation();
  const params = useParams<{ blockId?: string, questionId?: string }>();
  const isUpdatingRef = useRef(false);
  
  // Sincronizza il componente con l'URL quando cambia
  useEffect(() => {
    // Se già stiamo aggiornando, evita di creare un loop
    if (isUpdatingRef.current) {
      return;
    }
    
    if (params.blockId && params.questionId) {
      // Se l'URL contiene blockId e questionId, ma sono diversi dallo stato attuale,
      // aggiorna lo stato interno per allinearlo all'URL
      if (state.activeQuestion.block_id !== params.blockId || 
          state.activeQuestion.question_id !== params.questionId) {
        
        // Segna che stiamo aggiornando per evitare loop
        isUpdatingRef.current = true;
        
        // Chiamiamo goToQuestion con replace=true per sostituire la history entry
        goToQuestion(params.blockId, params.questionId, true);
        
        // Reset del flag dopo un breve ritardo
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 50);
      }
    }
  }, [
    location.pathname, 
    params.blockId, 
    params.questionId, 
    state.activeQuestion.block_id, 
    state.activeQuestion.question_id, 
    goToQuestion
  ]);
  
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
