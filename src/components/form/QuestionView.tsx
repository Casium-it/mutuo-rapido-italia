import React, { useEffect, useState } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { submitFormToSupabase } from "@/services/formSubmissionService";

export function QuestionView() {
  const { 
    state, 
    blocks, 
    goToQuestion, 
    isBlockCompleted,
    markBlockAsCompleted,
    getIncompleteBlocks
  } = useFormExtended();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{ blockId?: string, questionId?: string }>();
  const [showStopFlow, setShowStopFlow] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
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
    }
  }, [state.activeQuestion]);

  // Handle end of form question
  useEffect(() => {
    // Check if current question is an end-of-form question
    if (activeQuestion?.endOfForm && activeBlock) {
      // Automatically mark the current block as completed
      if (!isBlockCompleted(activeBlock.block_id)) {
        markBlockAsCompleted(activeBlock.block_id);
      }
    }
  }, [activeQuestion, activeBlock, isBlockCompleted, markBlockAsCompleted]);

  // Check if all blocks are completed
  const allActiveBlocks = [...state.activeBlocks];
  const allBlocksCompleted = allActiveBlocks.every(blockId => 
    state.completedBlocks.includes(blockId)
  );

  // Get list of incomplete blocks for display
  const incompleteBlocks = allActiveBlocks
    .filter(blockId => !state.completedBlocks.includes(blockId))
    .map(blockId => blocks.find(block => block.block_id === blockId))
    .filter(Boolean);

  // Check if there are any dynamic blocks that are not completed
  const isEndOfFormQuestion = activeQuestion?.endOfForm === true;
  
  // Handle form submission
  const handleSubmitForm = async () => {
    if (!allBlocksCompleted) {
      toast.error("Completa tutti i blocchi prima di procedere", {
        description: "Ci sono sezioni del form che devono essere completate",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // This will use the same service function used by CompleteFormButton
      await submitFormToSupabase(state);
      // Navigate to form-loading page
      navigate("/form-loading");
    } catch (error) {
      console.error("Errore durante l'invio del form:", error);
      toast.error("Si è verificato un errore durante l'invio del form", {
        description: "Riprova più tardi o contattaci per assistenza",
      });
      setIsSubmitting(false);
    }
  };

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

      {/* Special End of Form UI */}
      {isEndOfFormQuestion ? (
        <div className="space-y-6">
          <div className="p-6 bg-[#F8F4EF] border border-[#BEB8AE] rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Riepilogo della tua richiesta</h2>
            
            {allBlocksCompleted ? (
              <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-700">Tutti i blocchi sono completi!</p>
                  <p className="mt-1 text-sm text-green-600">La tua richiesta è pronta per essere inviata.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-red-700">Ci sono sezioni da completare</p>
                    <p className="mt-1 text-sm text-red-600">
                      Completa tutte le sezioni prima di inviare la richiesta.
                    </p>
                  </div>
                </div>
                
                <div className="pl-4 border-l-2 border-red-200">
                  <h3 className="font-medium text-red-900 mb-2">Sezioni da completare:</h3>
                  <ul className="space-y-2">
                    {incompleteBlocks.map((block) => (
                      <li key={block?.block_id} className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-gray-700">{block?.title}</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="link"
                          className="ml-2 text-[#245C4F] p-0 h-auto"
                          onClick={() => {
                            if (block && block.questions.length > 0) {
                              goToQuestion(block.block_id, block.questions[0].question_id);
                            }
                          }}
                        >
                          Vai alla sezione
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleSubmitForm}
                disabled={!allBlocksCompleted || isSubmitting}
                className={`${
                  !allBlocksCompleted 
                    ? "bg-[#a0c3be] cursor-not-allowed" 
                    : "bg-[#245C4F] hover:bg-[#1e4f44]"
                } text-white px-8 py-3 rounded-[10px] text-[16px] font-medium ${
                  !allBlocksCompleted 
                    ? "shadow-[0_3px_0_0_#8daca7]" 
                    : "shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37]"
                } w-full sm:w-auto transition-all`}
              >
                {isSubmitting ? "Invio in corso..." : "Invia Form"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <FormQuestion question={activeQuestion} />
        </div>
      )}
    </div>
  );
}
