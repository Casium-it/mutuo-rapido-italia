
import React, { useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useParams } from "react-router-dom";

export function QuestionView() {
  const { 
    state, 
    blocks, 
    goToQuestion, 
    saveCurrentLoopEntry, 
    isQuestionInLoop, 
    getCurrentLoopState,
    isLastQuestionInLoop,
    getLoopManagerQuestion
  } = useFormExtended();
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
  
  // Effetto per gestire l'uscita da un loop
  useEffect(() => {
    // Controlla se la domanda corrente non fa parte del loop attivo (uscita dal loop)
    const currentLoop = getCurrentLoopState();
    if (currentLoop && state.activeQuestion.question_id) {
      const currentQuestionInLoop = isQuestionInLoop(state.activeQuestion.question_id, currentLoop.loop_id);
      
      // Se siamo usciti dal loop ma abbiamo ancora currentLoop attivo
      if (!currentQuestionInLoop) {
        // Controlla se la domanda corrente è un loop manager per lo stesso loop
        const loopManagerQuestion = getLoopManagerQuestion(currentLoop.loop_id);
        const isCurrentLoopManager = loopManagerQuestion && 
          loopManagerQuestion.question_id === state.activeQuestion.question_id;
          
        // Se non siamo al loop manager, salviamo l'entry e usciamo dal loop
        if (!isCurrentLoopManager) {
          console.log("[QuestionView] Rilevata uscita dal loop, salvataggio automatico");
          saveCurrentLoopEntry();
        }
      }
    }
  }, [
    state.activeQuestion, 
    getCurrentLoopState, 
    isQuestionInLoop, 
    saveCurrentLoopEntry,
    getLoopManagerQuestion
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
