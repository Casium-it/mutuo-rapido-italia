
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

  // Check for inline questions that should follow current question
  const findInlineFollowUpQuestions = (): { question: Question; previousResponse: string | string[] | undefined }[] => {
    const inlineFollowUpQuestions: { question: Question; previousResponse: string | string[] | undefined }[] = [];
    
    // Find the current question index
    const currentQuestionIndex = activeBlock.questions.findIndex(q => q.question_id === activeQuestion.question_id);
    if (currentQuestionIndex === -1) return [];
    
    // Check if there are inline questions after this one
    for (let i = currentQuestionIndex + 1; i < activeBlock.questions.length; i++) {
      const nextQuestion = activeBlock.questions[i];
      if (nextQuestion.inline) {
        // Check if the previous question has been answered
        const previousQuestionId = activeBlock.questions[i - 1].question_id;
        const previousPlaceholderKey = Object.keys(activeBlock.questions[i - 1].placeholders)[0];
        const previousResponse = previousPlaceholderKey 
          ? state.responses[previousQuestionId]?.[previousPlaceholderKey]
          : undefined;
        
        if (previousResponse) {
          inlineFollowUpQuestions.push({
            question: nextQuestion,
            previousResponse
          });
        }
      } else {
        // Stop at the first non-inline question
        break;
      }
    }
    
    return inlineFollowUpQuestions;
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
