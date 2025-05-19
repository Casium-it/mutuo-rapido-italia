
import React, { useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export function QuestionView() {
  const { state, blocks, goToQuestion } = useFormExtended();
  const location = useLocation();
  const params = useParams<{ blockId?: string, questionId?: string }>();
  const navigate = useNavigate();
  
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

  // Handle stop_flow redirection
  useEffect(() => {
    // Check if the current question leads to stop_flow
    if (activeQuestion) {
      const leadsToStopFlow = Object.values(activeQuestion.placeholders).some(placeholder => {
        if (placeholder.type === "select") {
          const response = state.responses[activeQuestion.question_id]?.[Object.keys(activeQuestion.placeholders).find(
            key => activeQuestion.placeholders[key] === placeholder
          ) || ""];
          
          if (response) {
            const selectedOption = (placeholder as any).options.find((opt: any) => opt.id === response);
            return selectedOption?.leads_to === "stop_flow";
          }
        }
        return false;
      });
      
      if (leadsToStopFlow) {
        // Store current path in sessionStorage before navigating
        sessionStorage.setItem('previousPath', location.pathname);
        navigate("/stop-flow");
      }
    }
  }, [activeQuestion, state.responses, navigate, location]);

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
