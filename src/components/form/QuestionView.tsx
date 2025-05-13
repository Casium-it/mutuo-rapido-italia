
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

  // Funzione migliorata per trovare domande di follow-up inline con le relative informazioni
  const findInlineFollowUpQuestions = (): { 
    question: Question; 
    previousQuestion: Question; 
    previousPlaceholderKey: string; 
    previousResponse: string | string[] | undefined 
  }[] => {
    const inlineFollowUpQuestions: { 
      question: Question; 
      previousQuestion: Question;
      previousPlaceholderKey: string;
      previousResponse: string | string[] | undefined 
    }[] = [];
    
    // Trova l'indice della domanda corrente
    const currentQuestionIndex = activeBlock.questions.findIndex(q => q.question_id === activeQuestion.question_id);
    if (currentQuestionIndex === -1) return [];
    
    // Inizializzazione per seguire la catena delle domande inline
    let previousQuestion = activeQuestion;
    let previousQuestionId = activeQuestion.question_id;
    let previousPlaceholderKey = Object.keys(previousQuestion.placeholders)[0];
    let previousResponse = state.responses[previousQuestionId]?.[previousPlaceholderKey];
    let nextQuestionId = getLeadsToFromResponse(previousQuestion, previousPlaceholderKey, previousResponse);

    // Se la risposta corrente non porta ad una domanda specifica o porta a next_block, non mostrare domande inline
    if (!nextQuestionId || nextQuestionId === "next_block") {
      return [];
    }
    
    // Cerca domande inline basate sul valore leads_to della risposta
    for (let i = 0; i < activeBlock.questions.length; i++) {
      // Salta la domanda corrente
      if (activeBlock.questions[i].question_id === activeQuestion.question_id) continue;
      
      const potentialInlineQuestion = activeBlock.questions[i];
      
      // Controlla se questa domanda è inline e corrisponde al leads_to della risposta precedente
      if (potentialInlineQuestion.inline && potentialInlineQuestion.question_id === nextQuestionId) {
        // Aggiungi questa domanda inline alla catena
        inlineFollowUpQuestions.push({
          question: potentialInlineQuestion,
          previousQuestion,
          previousPlaceholderKey,
          previousResponse
        });
        
        // Aggiorna per la prossima iterazione
        previousQuestion = potentialInlineQuestion;
        previousQuestionId = potentialInlineQuestion.question_id;
        previousPlaceholderKey = Object.keys(previousQuestion.placeholders)[0];
        previousResponse = state.responses[previousQuestionId]?.[previousPlaceholderKey];
        nextQuestionId = getLeadsToFromResponse(previousQuestion, previousPlaceholderKey, previousResponse);
        
        // Se non c'è una risposta o il leads_to è next_block, interrompi la catena
        if (!previousResponse || !nextQuestionId || nextQuestionId === "next_block") {
          break;
        }
      }
    }
    
    return inlineFollowUpQuestions;
  };
  
  // Funzione per ottenere il leads_to da una risposta
  const getLeadsToFromResponse = (
    question: Question, 
    placeholderKey: string, 
    response: string | string[] | undefined
  ): string | undefined => {
    if (!response) return undefined;
    
    if (question.placeholders[placeholderKey].type === "select" && !Array.isArray(response)) {
      const options = (question.placeholders[placeholderKey] as any).options;
      const selectedOption = options.find((opt: any) => opt.id === response);
      return selectedOption?.leads_to;
    } else if (question.placeholders[placeholderKey].type === "input") {
      return (question.placeholders[placeholderKey] as any).leads_to;
    }
    
    return undefined;
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
      <div className="space-y-4">
        {/* Main question - ALWAYS hide the button since we'll control it from here */}
        <FormQuestion 
          question={activeQuestion} 
          hideNextButton={true} 
        />
        
        {/* Inline follow-up questions - ora renderizzate come domande normali con info sulla domanda precedente */}
        {inlineFollowUpQuestions.map((followUp, index) => (
          <FormQuestion
            key={followUp.question.question_id}
            question={followUp.question}
            hideNextButton={true}
            isInlineQuestion={true}
            previousQuestionId={followUp.previousQuestion.question_id}
            previousPlaceholderKey={followUp.previousPlaceholderKey}
            previousResponse={followUp.previousResponse}
          />
        ))}
        
        {/* Pulsante Avanti universale (mostrato solo se tutte le domande hanno risposte) */}
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
