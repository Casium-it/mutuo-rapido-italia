
import React, { useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { FormQuestion } from "./FormQuestion";
import { Question } from "@/types/form";
import { useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuestionView() {
  const { state, blocks, goToQuestion, navigateToNextQuestion } = useForm();
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

  // Funzione migliorata per verificare se ci sono delle domande inline che dovrebbero seguire questa
  const hasInlineFollowUpQuestions = (): boolean => {
    // Trova l'indice della domanda corrente
    const currentQuestionIndex = activeBlock.questions.findIndex(q => q.question_id === activeQuestion.question_id);
    if (currentQuestionIndex === -1) return false;
    
    // Controlla se ci sono domande inline che seguono questa in base al valore leads_to
    const mainPlaceholderKey = Object.keys(activeQuestion.placeholders)[0];
    if (!mainPlaceholderKey) return false;
    
    const response = state.responses[activeQuestion.question_id]?.[mainPlaceholderKey];
    if (!response) return false;
    
    let nextQuestionId;
    
    if (activeQuestion.placeholders[mainPlaceholderKey].type === "select" && !Array.isArray(response)) {
      const options = (activeQuestion.placeholders[mainPlaceholderKey] as any).options;
      const selectedOption = options.find((opt: any) => opt.id === response);
      nextQuestionId = selectedOption?.leads_to;
    } else if (activeQuestion.placeholders[mainPlaceholderKey].type === "input") {
      nextQuestionId = (activeQuestion.placeholders[mainPlaceholderKey] as any).leads_to;
    }
    
    if (!nextQuestionId || nextQuestionId === "next_block") return false;
    
    // Cerca se esiste una domanda inline con questo ID
    const nextQuestion = activeBlock.questions.find(q => q.question_id === nextQuestionId);
    return nextQuestion?.inline === true;
  };
  
  // Verifica se tutte le domande hanno risposte valide
  const checkAllQuestionsAnswered = (): boolean => {
    // Verifica la domanda principale
    return Object.keys(activeQuestion.placeholders).every(key => 
      state.responses[activeQuestion.question_id]?.[key] !== undefined
    );
  };
  
  // Gestisce la navigazione alla prossima domanda
  const handleNextQuestion = () => {
    const mainKey = Object.keys(activeQuestion.placeholders)[0];
    const response = state.responses[activeQuestion.question_id]?.[mainKey];
    
    if (response && activeQuestion.placeholders[mainKey].type === "select" && !Array.isArray(response)) {
      const options = (activeQuestion.placeholders[mainKey] as any).options;
      const selectedOption = options.find((opt: any) => opt.id === response);
      
      if (selectedOption?.leads_to) {
        navigateToNextQuestion(activeQuestion.question_id, selectedOption.leads_to);
        return;
      }
    } else if (response && activeQuestion.placeholders[mainKey].type === "input") {
      const leadsTo = (activeQuestion.placeholders[mainKey] as any).leads_to;
      if (leadsTo) {
        navigateToNextQuestion(activeQuestion.question_id, leadsTo);
        return;
      }
    }
    
    // Se non c'è un leads_to specifico, vai al prossimo blocco
    navigateToNextQuestion(activeQuestion.question_id, "next_block");
  };
  
  // Determina se mostrare il pulsante Avanti in base alle risposte
  const shouldShowNextButton = checkAllQuestionsAnswered() && !hasInlineFollowUpQuestions();

  return (
    <div className="max-w-2xl">
      <div className="space-y-4">
        {/* Renderizziamo solo la domanda principale, che ora include la logica per gestire eventuali domande inline */}
        <FormQuestion 
          question={activeQuestion} 
          hideNextButton={hasInlineFollowUpQuestions()}
        />
        
        {/* Pulsante Avanti universale (mostrato solo se tutte le domande hanno risposte e non ci sono domande inline) */}
        {shouldShowNextButton && (
          <div className="mt-4">
            <Button
              type="button"
              className={cn(
                "bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[32px] py-[16px] rounded-[12px] text-[17px] font-medium",
                "transition-all shadow-[0_6px_12px_rgba(36,92,79,0.2)] hover:shadow-[0_8px_16px_rgba(36,92,79,0.25)]",
                "inline-flex items-center gap-[12px]"
              )}
              onClick={handleNextQuestion}
              disabled={state.isNavigating || Object.keys(activeQuestion.placeholders).length === 0}
            >
              Avanti <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
