
import React, { useEffect, useState } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useParams } from "react-router-dom";

export function QuestionView() {
  const { state, blocks, goToQuestion } = useFormExtended();
  const location = useLocation();
  const params = useParams<{ blockId?: string, questionId?: string }>();
  const [showStopFlow, setShowStopFlow] = useState<boolean>(false);
  
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

  // Rileva se la navigazione è stata impostata su "stop_flow"
  useEffect(() => {
    const stopFlowStatus = sessionStorage.getItem("stopFlowActivated");
    if (stopFlowStatus === "true") {
      setShowStopFlow(true);
      // Pulisci la variabile di sessione dopo l'utilizzo
      sessionStorage.removeItem("stopFlowActivated");
      
      // Non marchiamo più il blocco come completato qui, lasciamo che sia
      // la navigazione a gestirlo correttamente
    }
  }, [state.activeQuestion]);

  if (!activeBlock || !activeQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Domanda non trovata.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {showStopFlow && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md shadow-sm animate-fade-in">
          <p className="text-red-600 font-medium mb-2">
            Attualmente non supportiamo questo caso particolare, ma ci stiamo lavorando.
          </p>
          <p className="text-gray-700 mb-3">
            Se hai bisogno di supporto personalizzato, contattaci a{" "}
            <a 
              href="mailto:info@gomutuo.it" 
              className="text-[#245C4F] underline hover:text-[#1e4f44] font-medium"
            >
              info@gomutuo.it
            </a>
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <button 
              onClick={() => setShowStopFlow(false)}
              className="px-3 py-1.5 text-[#245C4F] bg-white border border-[#245C4F] rounded-md text-sm font-medium hover:bg-[#f8f8f8]"
            >
              Continua con un'altra selezione
            </button>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <FormQuestion question={activeQuestion} />
      </div>
    </div>
  );
}
