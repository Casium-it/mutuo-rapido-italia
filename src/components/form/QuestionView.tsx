
import React, { useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { FormQuestion } from "./FormQuestion";
import { InlineFormQuestion } from "./InlineFormQuestion";
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

  // Funzione migliorata per trovare domande inline di follow-up
  const findInlineFollowUpQuestions = (): { question: Question; previousResponse: string | string[] | undefined }[] => {
    const inlineFollowUpQuestions: { question: Question; previousResponse: string | string[] | undefined }[] = [];
    
    // Trova l'indice della domanda corrente
    const currentQuestionIndex = activeBlock.questions.findIndex(q => q.question_id === activeQuestion.question_id);
    if (currentQuestionIndex === -1) return [];
    
    // Controlla se ci sono domande inline dopo questa
    for (let i = currentQuestionIndex + 1; i < activeBlock.questions.length; i++) {
      const nextQuestion = activeBlock.questions[i];
      if (nextQuestion.inline) {
        // Controlla se la domanda precedente è stata risposta
        const previousQuestionId = activeBlock.questions[i - 1].question_id;
        const previousPlaceholderKey = Object.keys(activeBlock.questions[i - 1].placeholders)[0];
        const previousResponse = previousPlaceholderKey 
          ? state.responses[previousQuestionId]?.[previousPlaceholderKey]
          : undefined;
        
        // Verifica se c'è una risposta e se corrisponde a una condizione per mostrare questa domanda inline
        if (previousResponse) {
          // Determina se questa domanda inline dovrebbe essere mostrata in base alla risposta precedente
          const shouldShow = determineIfInlineQuestionShouldShow(
            activeBlock.questions[i - 1], 
            previousPlaceholderKey, 
            previousResponse, 
            nextQuestion.question_id
          );
          
          if (shouldShow) {
            inlineFollowUpQuestions.push({
              question: nextQuestion,
              previousResponse
            });
          } else {
            break; // Se una domanda inline non dovrebbe essere mostrata, ferma la catena
          }
        } else {
          break; // Se non c'è risposta, ferma la catena
        }
      } else {
        // Stop at the first non-inline question
        break;
      }
    }
    
    return inlineFollowUpQuestions;
  };
  
  // Funzione per determinare se una domanda inline dovrebbe essere mostrata
  const determineIfInlineQuestionShouldShow = (
    previousQuestion: Question, 
    placeholderKey: string, 
    response: string | string[], 
    nextQuestionId: string
  ): boolean => {
    // Se la risposta è un array (multi-select), controlla se almeno una opzione porta a questa domanda
    if (Array.isArray(response)) {
      return true; // Per ora mostriamo sempre per multi-select, potremmo affinare questa logica
    }
    
    // Per select singoli, controlla se l'opzione selezionata porta a questa domanda
    if (previousQuestion.placeholders[placeholderKey].type === "select") {
      const selectedOption = (previousQuestion.placeholders[placeholderKey] as any).options.find(
        (opt: any) => opt.id === response
      );
      
      // Se l'opzione ha un leads_to specifico per questa domanda inline
      return !!selectedOption;
    }
    
    return true; // Per input, mostriamo sempre se c'è una risposta
  };

  const inlineFollowUpQuestions = findInlineFollowUpQuestions();
  
  // Verifica se tutte le domande hanno risposte valide
  const checkAllQuestionsAnswered = () => {
    // Verifica la domanda principale
    const mainQuestionAnswered = Object.keys(activeQuestion.placeholders).every(key => 
      state.responses[activeQuestion.question_id]?.[key] !== undefined
    );
    
    if (!mainQuestionAnswered || inlineFollowUpQuestions.length === 0) {
      return mainQuestionAnswered;
    }
    
    // Verifica tutte le domande inline
    return inlineFollowUpQuestions.every(follow => {
      const questionId = follow.question.question_id;
      return Object.keys(follow.question.placeholders).every(key => 
        state.responses[questionId]?.[key] !== undefined
      );
    });
  };
  
  // Gestisce la navigazione alla prossima domanda
  const handleNextQuestion = () => {
    // Se ci sono domande inline, verifica l'ultima per la navigazione
    if (inlineFollowUpQuestions.length > 0) {
      const lastInlineQuestion = inlineFollowUpQuestions[inlineFollowUpQuestions.length - 1].question;
      const lastKey = Object.keys(lastInlineQuestion.placeholders)[0];
      
      if (lastInlineQuestion.placeholders[lastKey].type === "select") {
        const response = state.responses[lastInlineQuestion.question_id]?.[lastKey];
        
        if (response && !Array.isArray(response)) {
          const options = (lastInlineQuestion.placeholders[lastKey] as any).options;
          const selectedOption = options.find((opt: any) => opt.id === response);
          
          if (selectedOption?.leads_to) {
            navigateToNextQuestion(lastInlineQuestion.question_id, selectedOption.leads_to);
            return;
          }
        }
      } else if (lastInlineQuestion.placeholders[lastKey].type === "input") {
        const leadsTo = (lastInlineQuestion.placeholders[lastKey] as any).leads_to;
        if (leadsTo) {
          navigateToNextQuestion(lastInlineQuestion.question_id, leadsTo);
          return;
        }
      }
      
      // Se non c'è un leads_to specifico, vai al prossimo blocco
      navigateToNextQuestion(lastInlineQuestion.question_id, "next_block");
    } else {
      // Naviga usando la domanda principale
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
    }
  };
  
  // Determina se mostrare il pulsante Avanti in base alle risposte
  const shouldShowNextButton = checkAllQuestionsAnswered();

  return (
    <div className="max-w-2xl">
      {/* Contenitore per la domanda principale e le domande inline */}
      <div className="space-y-4">
        {/* Main question senza pulsante Avanti se ci sono domande inline */}
        <FormQuestion 
          question={activeQuestion} 
          hideNextButton={inlineFollowUpQuestions.length > 0} 
        />
        
        {/* Inline follow-up questions */}
        {inlineFollowUpQuestions.map((followUp, index) => (
          <div key={followUp.question.question_id} className="mt-1">
            <InlineFormQuestion
              question={followUp.question}
              previousQuestion={
                index === 0
                  ? activeQuestion
                  : inlineFollowUpQuestions[index - 1].question
              }
              previousResponse={followUp.previousResponse}
              isLastInline={index === inlineFollowUpQuestions.length - 1}
              hideNextButton={true}
            />
          </div>
        ))}
        
        {/* Pulsante Avanti universale (mostrato solo se tutte le domande hanno risposte) */}
        {shouldShowNextButton && (
          <div className="mt-4">
            <Button
              type="button"
              size="sm"
              className={cn(
                "bg-[#245C4F] hover:bg-[#1e4f44] text-white rounded-[12px] transition-all",
                "shadow-[0_6px_12px_rgba(36,92,79,0.2)] hover:shadow-[0_8px_16px_rgba(36,92,79,0.25)]",
                "text-[17px] font-medium px-[32px] py-[12px] inline-flex items-center gap-[12px]"
              )}
              onClick={handleNextQuestion}
            >
              Avanti <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
