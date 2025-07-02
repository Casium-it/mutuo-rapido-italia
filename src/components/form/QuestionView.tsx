
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { FormQuestion } from "./FormQuestion";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

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
  
  // Memoize URL synchronization to prevent unnecessary re-renders
  const shouldSyncWithUrl = useMemo(() => {
    return params.blockId && params.questionId && 
           (state.activeQuestion.block_id !== params.blockId || 
            state.activeQuestion.question_id !== params.questionId);
  }, [params.blockId, params.questionId, state.activeQuestion]);

  // Optimize URL synchronization with useCallback
  const syncWithUrl = useCallback(() => {
    if (shouldSyncWithUrl && params.blockId && params.questionId) {
      console.log('🔄 Syncing with URL:', params.blockId, params.questionId);
      goToQuestion(params.blockId, params.questionId, true);
    }
  }, [shouldSyncWithUrl, params.blockId, params.questionId, goToQuestion]);

  // Stable URL sync effect
  useEffect(() => {
    syncWithUrl();
  }, [syncWithUrl]);
  
  // Stable stop flow effect
  useEffect(() => {
    const stopFlowStatus = sessionStorage.getItem("stopFlowActivated");
    if (stopFlowStatus === "true") {
      setShowStopFlow(true);
      sessionStorage.removeItem("stopFlowActivated");
    }
  }, [state.activeQuestion.question_id]); // Only depend on question ID

  // Memoize active block and question lookups
  const activeBlock = useMemo(() => 
    blocks.find(block => block.block_id === state.activeQuestion.block_id),
    [blocks, state.activeQuestion.block_id]
  );

  const activeQuestion = useMemo(() => 
    activeBlock?.questions.find(question => question.question_id === state.activeQuestion.question_id),
    [activeBlock, state.activeQuestion.question_id]
  );

  // Optimize end-of-form handling with useCallback
  const handleEndOfFormCompletion = useCallback(() => {
    if (activeQuestion?.endOfForm && activeBlock && !isBlockCompleted(activeBlock.block_id)) {
      console.log('📋 Auto-completing block for end-of-form question:', activeBlock.block_id);
      markBlockAsCompleted(activeBlock.block_id);
    }
  }, [activeQuestion?.endOfForm, activeBlock, isBlockCompleted, markBlockAsCompleted]);

  // Stable end-of-form effect
  useEffect(() => {
    handleEndOfFormCompletion();
  }, [handleEndOfFormCompletion]);

  // Memoize completion calculations
  const allActiveBlocks = useMemo(() => [...state.activeBlocks], [state.activeBlocks]);
  
  const allBlocksCompleted = useMemo(() => 
    allActiveBlocks.every(blockId => state.completedBlocks.includes(blockId)),
    [allActiveBlocks, state.completedBlocks]
  );

  const incompleteBlocks = useMemo(() => 
    allActiveBlocks
      .filter(blockId => !state.completedBlocks.includes(blockId))
      .map(blockId => blocks.find(block => block.block_id === blockId))
      .filter(Boolean),
    [allActiveBlocks, state.completedBlocks, blocks]
  );

  const isEndOfFormQuestion = useMemo(() => 
    activeQuestion?.endOfForm === true,
    [activeQuestion?.endOfForm]
  );
  
  // Optimize form submission with useCallback
  const handleSubmitForm = useCallback(async () => {
    if (!allBlocksCompleted) {
      console.warn('⚠️ Attempted to submit incomplete form');
      return;
    }

    console.log('📤 Submitting form with data:', {
      responses: state.responses,
      activeBlocks: state.activeBlocks,
      completedBlocks: state.completedBlocks,
      dynamicBlocks: state.dynamicBlocks,
      formSlug: state.formSlug
    });

    navigate("/form-loading", {
      state: { 
        formData: {
          responses: state.responses,
          activeBlocks: state.activeBlocks,
          completedBlocks: state.completedBlocks,
          dynamicBlocks: state.dynamicBlocks,
          formSlug: state.formSlug
        }
      }
    });
  }, [allBlocksCompleted, state, navigate]);

  // Optimize navigation to incomplete blocks
  const navigateToIncompleteBlock = useCallback((block: any) => {
    if (block && block.questions.length > 0) {
      console.log('🔍 Navigating to incomplete block:', block.block_id);
      goToQuestion(block.block_id, block.questions[0].question_id);
    }
  }, [goToQuestion]);

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
                          onClick={() => navigateToIncompleteBlock(block)}
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
                disabled={!allBlocksCompleted}
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
                Invia Form
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
