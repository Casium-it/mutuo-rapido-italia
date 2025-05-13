
import React, { useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { FormQuestion } from "./FormQuestion";
import { Question } from "@/types/form";
import { useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntegratedQuestionView } from "./IntegratedQuestionView";

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
  
  // Utilizza il nuovo componente IntegratedQuestionView che gestisce tutte le domande
  return (
    <div className="max-w-2xl">
      <IntegratedQuestionView 
        mainQuestion={activeQuestion}
        inlineQuestions={inlineFollowUpQuestions}
        getLeadsToFromResponse={getLeadsToFromResponse}
      />
    </div>
  );
}
