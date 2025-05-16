
import React from "react";
import { Question } from "@/types/form";
import { FormQuestionProvider } from "./FormQuestionProvider";
import { QuestionRenderer } from "./QuestionRenderer";
import { getQuestionTextWithClickableResponses } from "@/utils/formUtils";
import { useFormExtended } from "@/hooks/useFormExtended";

interface FormQuestionProps {
  question: Question;
}

export function FormQuestion({ question }: FormQuestionProps) {
  const { state, getInlineQuestionChain } = useFormExtended();
  
  // Funzione per renderizzare il testo della domanda con placeholders
  const renderQuestionText = () => {
    // Se questa è una domanda inline, mostriamo la catena di domande precedenti
    if (question.inline === true) {
      const inlineChain = getInlineQuestionChain(
        state.activeQuestion.block_id, 
        state.activeQuestion.question_id
      );
      
      if (inlineChain.length > 0) {
        // Renderizza la catena di domande inline con le risposte cliccabili
        return (
          <>
            {inlineChain.map((q, index) => {
              const { parts } = getQuestionTextWithClickableResponses(q, state.responses);
              return (
                <span key={`inline-${q.question_id}`} className="inline">
                  {parts.map((part, partIndex) => {
                    if (part.type === 'text') {
                      return <span key={`part-${index}-${partIndex}`}>{part.content}</span>;
                    } else {
                      return (
                        <span 
                          key={`part-${index}-${partIndex}`}
                          className="bg-[#F8F4EF] text-[#245C4F] font-semibold px-[10px] py-[4px] rounded-[6px] text-[16px] cursor-pointer mx-1"
                        >
                          {part.content}
                        </span>
                      );
                    }
                  })}
                  {index < inlineChain.length - 1 ? " " : ""}
                </span>
              );
            })}
            <span className="ml-1">{question.question_text}</span>
          </>
        );
      }
    }
    
    // Se non è una domanda inline o non ci sono domande precedenti,
    // renderizziamo il testo normalmente
    return question.question_text;
  };

  return (
    <FormQuestionProvider question={question}>
      <QuestionRenderer 
        question={question}
        questionText={renderQuestionText()}
        showNavigationButtons={true}
        nextButtonText="Avanti"
        prevButtonText="Indietro"
      />
    </FormQuestionProvider>
  );
}
