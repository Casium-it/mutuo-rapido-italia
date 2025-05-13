
import React from "react";
import { useForm } from "@/contexts/FormContext";
import { FormQuestion } from "./FormQuestion";
import { InlineFormQuestion } from "./InlineFormQuestion";
import { Question } from "@/types/form";

export function QuestionView() {
  const { state, blocks } = useForm();
  
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

  return (
    <div className="max-w-2xl">
      {/* Main question */}
      <FormQuestion question={activeQuestion} />
      
      {/* Inline follow-up questions */}
      {inlineFollowUpQuestions.map((followUp, index) => (
        <div key={followUp.question.question_id} className="mt-4">
          <InlineFormQuestion
            question={followUp.question}
            previousQuestion={
              index === 0
                ? activeQuestion
                : inlineFollowUpQuestions[index - 1].question
            }
            previousResponse={followUp.previousResponse}
          />
        </div>
      ))}
    </div>
  );
}
