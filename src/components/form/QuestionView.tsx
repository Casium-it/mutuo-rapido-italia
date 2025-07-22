
import React, { useEffect, useState } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { CompletionStatus } from "./CompletionStatus";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { completedSave } from "@/services/smartSaveService";

export function QuestionView() {
  const {
    state,
    blocks,
    goToQuestion,
    isBlockCompleted,
    markBlockAsCompleted,
    getIncompleteBlocks,
    formSlug,
    getPreviousQuestion
  } = useFormExtended();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{
    blockId?: string;
    questionId?: string;
  }>();
  const [showStopFlow, setShowStopFlow] = useState<boolean>(false);

  // Sincronizza il componente con l'URL quando cambia
  useEffect(() => {
    if (params.blockId && params.questionId) {
      // Se l'URL contiene blockId e questionId, ma sono diversi dallo stato attuale,
      // aggiorna lo stato interno per allinearlo all'URL
      if (state.activeQuestion.block_id !== params.blockId || state.activeQuestion.question_id !== params.questionId) {
        goToQuestion(params.blockId, params.questionId, true);
      }
    }
  }, [location.pathname, params.blockId, params.questionId, state.activeQuestion, goToQuestion]);

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
    // Find the current active block and question
    const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);
    const activeQuestion = activeBlock?.questions.find(question => question.question_id === state.activeQuestion.question_id);

    // Check if current question is an end-of-form question
    if (activeQuestion?.endOfForm && activeBlock) {
      // Automatically mark the current block as completed
      if (!isBlockCompleted(activeBlock.block_id)) {
        markBlockAsCompleted(activeBlock.block_id);
      }
    }
  }, [state.activeQuestion, blocks, isBlockCompleted, markBlockAsCompleted]);

  // Check if all blocks are completed
  const allActiveBlocks = [...state.activeBlocks];
  const allBlocksCompleted = allActiveBlocks.every(blockId => state.completedBlocks.includes(blockId));

  // Get list of incomplete blocks for display
  const incompleteBlocks = allActiveBlocks.filter(blockId => !state.completedBlocks.includes(blockId)).map(blockId => blocks.find(block => block.block_id === blockId)).filter(Boolean);

  // Find the current active block and question
  const activeBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);
  const activeQuestion = activeBlock?.questions.find(question => question.question_id === state.activeQuestion.question_id);

  // Check if there are any dynamic blocks that are not completed
  const isEndOfFormQuestion = activeQuestion?.endOfForm === true;

  // Get previous question for back navigation
  const previousQuestion = getPreviousQuestion(state.activeQuestion.block_id, state.activeQuestion.question_id);

  // Handle back navigation
  const handleBackNavigation = () => {
    if (previousQuestion) {
      goToQuestion(previousQuestion.block_id, previousQuestion.question_id);
    }
  };

  // Handle form submission - Navigate immediately to loading page
  /**
   * PRIMARY FORM SUBMISSION PATH
   * 
   * This function handles the MAIN form submission flow for forms with endOfForm: true questions.
   * Most form submissions in the application go through this path.
   * 
   * ⚠️ IMPORTANT: When updating this submission logic, also update FormSubmitButton.tsx
   * to maintain consistency between both submission paths.
   * 
   * Both paths must have identical:
   * - formData structure (including simulationId)
   * - navigation logic
   * - error handling
   * - completedSave calls
   */
  const handleSubmitForm = async () => {
    if (!allBlocksCompleted) {
      return;
    }
    console.log("QuestionView.handleSubmitForm: Starting form submission...");
    console.log("QuestionView.handleSubmitForm: Using simulationId:", state.simulationId);
    console.log("QuestionView.handleSubmitForm: FormSlug:", formSlug);
    try {
      // Final completed form save with 100% completion before submission
      if (state.simulationId) {
        console.log("QuestionView.handleSubmitForm: Performing 100% completed form save...");
        const completeSaveResult = await completedSave(state.simulationId, state, formSlug || 'simulazione-mutuo');
        if (completeSaveResult.success) {
          console.log("✅ QuestionView.handleSubmitForm: 100% completed form save successful");
        } else {
          console.error("❌ QuestionView.handleSubmitForm: Completed form save failed:", completeSaveResult.error);
        }
      } else {
        console.warn("⚠️ QuestionView.handleSubmitForm: No simulationId found, skipping completed form save");
      }

      // Navigate immediately to loading page with form data
      navigate("/form-loading", {
        state: {
          formData: {
            responses: state.responses,
            activeBlocks: state.activeBlocks,
            completedBlocks: state.completedBlocks,
            dynamicBlocks: state.dynamicBlocks,
            formSlug: formSlug,
            simulationId: state.simulationId
          }
        }
      });
    } catch (error) {
      console.error('QuestionView.handleSubmitForm: Error during submission:', error);
      // Still navigate even if completed form save fails
      navigate("/form-loading", {
        state: {
          formData: {
            responses: state.responses,
            activeBlocks: state.activeBlocks,
            completedBlocks: state.completedBlocks,
            dynamicBlocks: state.dynamicBlocks,
            formSlug: formSlug,
            simulationId: state.simulationId
          }
        }
      });
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
            <a href="mailto:info@gomutuo.it" className="text-[#245C4F] underline hover:text-[#1e4f44] font-medium">
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

      {/* Standard form container for both regular and EndOfForm questions */}
      <div className="max-w-xl animate-fade-in">
        {isEndOfFormQuestion ? (
          <>
            {/* Dynamic question text based on completion status */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {allBlocksCompleted ? "Tutte le domande completate" : "Ci sono sezioni da completare"}
              </h1>
            </div>

            <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />

            {/* Completion status in main content area */}
            <div className="mb-8">
              <CompletionStatus 
                allBlocksCompleted={allBlocksCompleted}
                incompleteBlocks={incompleteBlocks}
                onNavigateToBlock={goToQuestion}
              />
            </div>

            {/* Standard navigation buttons */}
            <div className="mt-8 flex items-center gap-4">
              {/* Back button */}
              {previousQuestion && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackNavigation}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Indietro
                </Button>
              )}

              {/* Submit button styled as "Avanti" */}
              <Button
                onClick={handleSubmitForm}
                disabled={!allBlocksCompleted}
                className={`flex items-center gap-2 px-6 py-3 rounded-[10px] text-[16px] font-medium transition-all ${
                  !allBlocksCompleted 
                    ? "bg-[#a0c3be] cursor-not-allowed shadow-[0_3px_0_0_#8daca7]" 
                    : "bg-[#245C4F] hover:bg-[#1e4f44] shadow-[0_3px_0_0_#1a3f37] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_#1a3f37]"
                } text-white`}
              >
                Avanti
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <FormQuestion question={activeQuestion} />
          </div>
        )}
      </div>
    </div>
  );
}
