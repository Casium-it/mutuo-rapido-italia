
import React, { useState, useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { Separator } from "@/components/ui/separator";
import { getQuestionTextWithClickableResponses } from "@/utils/formUtils";

interface FormQuestionProps {
  question: Question;
}

export function FormQuestion({ question }: FormQuestionProps) {
  const { 
    getResponse, 
    setResponse, 
    navigateToNextQuestion, 
    getPreviousQuestionText,
    getPreviousQuestion, 
    getInlineQuestionChain,
    state, 
    addActiveBlock, 
    goToQuestion 
  } = useFormExtended();
  
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  // Stato per tenere traccia di quali placeholder hanno opzioni visibili
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  const params = useParams();

  // Effetto per caricare le risposte esistenti e impostare visibilità iniziale delle opzioni
  useEffect(() => {
    const existingResponses: { [key: string]: string | string[] } = {};
    const initialVisibleOptions: { [key: string]: boolean } = {};
    
    Object.keys(question.placeholders).forEach(key => {
      const existingResponse = getResponse(question.question_id, key);
      if (existingResponse) {
        existingResponses[key] = existingResponse;
        initialVisibleOptions[key] = false;
      } else {
        initialVisibleOptions[key] = true;
      }
    });
    
    setResponses(existingResponses);
    setVisibleOptions(initialVisibleOptions);
    setIsNavigating(false);
  }, [question.question_id, getResponse]);

  // Funzione per gestire il cambio di risposta
  const handleResponseChange = (key: string, value: string | string[]) => {
    setResponses({
      ...responses,
      [key]: value
    });
    
    setResponse(question.question_id, key, value);
    
    setVisibleOptions(prev => ({
      ...prev,
      [key]: false
    }));
    
    // Gestione dell'attivazione di blocchi aggiuntivi
    if (question.placeholders[key].type === "select" && !Array.isArray(value)) {
      const selectedOption = (question.placeholders[key] as any).options.find(
        (opt: any) => opt.id === value
      );
      
      if (selectedOption?.add_block) {
        addActiveBlock(selectedOption.add_block);
      }
    }
  };

  // Funzione per gestire il click sul placeholder
  const handlePlaceholderClick = (key: string) => {
    setVisibleOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Funzione per navigare alla domanda specificata quando si fa click su una risposta
  const handleQuestionClick = (questionId: string) => {
    const previousQuestion = getPreviousQuestion(state.activeQuestion.block_id, questionId);
    if (previousQuestion) {
      goToQuestion(state.activeQuestion.block_id, questionId);
    }
  };

  // Funzione per avanzare alla prossima domanda
  const handleNextQuestion = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    for (const key of Object.keys(question.placeholders)) {
      const response = responses[key] || getResponse(question.question_id, key);
      
      if (response && question.placeholders[key].type === "select" && !Array.isArray(response)) {
        const selectedOption = (question.placeholders[key] as any).options.find(
          (opt: any) => opt.id === response
        );
        
        if (selectedOption?.leads_to) {
          setTimeout(() => {
            navigateToNextQuestion(question.question_id, selectedOption.leads_to);
            setIsNavigating(false);
          }, 50);
          return;
        }
      } else if (response && question.placeholders[key].type === "input" && (question.placeholders[key] as any).leads_to) {
        setTimeout(() => {
          navigateToNextQuestion(question.question_id, (question.placeholders[key] as any).leads_to);
          setIsNavigating(false);
        }, 50);
        return;
      }
    }
    
    setTimeout(() => {
      navigateToNextQuestion(question.question_id, "next_block");
      setIsNavigating(false);
    }, 50);
  };

  // Funzione per ottenere il testo completo della domanda, includendo la sequenza di domande inline
  const getQuestionText = () => {
    // Se non è una domanda inline, restituisci semplicemente il testo della domanda
    if (question.inline !== true) {
      return question.question_text;
    }
    
    // Altrimenti, recupera la catena di domande inline
    const questionChain = getInlineQuestionChain(
      state.activeQuestion.block_id, 
      state.activeQuestion.question_id
    );
    
    // Se non ci sono domande nella catena, restituisci solo il testo della domanda attuale
    if (questionChain.length === 0) {
      return question.question_text;
    }
    
    // Altrimenti, restituisci la catena di domande + la domanda attuale
    return question.question_text;
  };

  // Funzione per renderizzare il testo della domanda con placeholders
  const renderQuestionText = () => {
    // Se questa è una domanda inline, mostriamo la catena di domande precedenti
    if (question.inline === true) {
      const inlineChain = getInlineQuestionChain(
        state.activeQuestion.block_id, 
        state.activeQuestion.question_id
      );
      
      if (inlineChain.length > 0) {
        // Renderizza la catena di domande inline
        return (
          <div className="inline">
            {/* Prima domanda (non inline) o inizio della catena */}
            {renderQuestionWithResponses(inlineChain[0])}
            
            {/* Domande inline intermedie */}
            {inlineChain.slice(1).map((q, index) => (
              <span key={`inline-${q.question_id}`}>
                {renderQuestionWithResponses(q)}
              </span>
            ))}
            
            {/* Domanda corrente */}
            <span className="ml-1">
              {!question.question_text.includes('{{') ? (
                <span>{question.question_text}</span>
              ) : renderQuestionPlaceholders(question.question_text)}
            </span>
          </div>
        );
      }
    }
    
    // Se non è una domanda inline o non ci sono domande precedenti,
    // renderizziamo il testo normalmente
    const fullText = getQuestionText();
    if (!fullText.includes('{{')) {
      return <span>{fullText}</span>;
    }
    
    return renderQuestionPlaceholders(fullText);
  };
  
  // Funzione per renderizzare una singola domanda con le sue risposte cliccabili
  const renderQuestionWithResponses = (q: Question) => {
    // Otteniamo le parti del testo con risposte cliccabili
    const { parts } = getQuestionTextWithClickableResponses(q, state.responses);
    
    return (
      <span className="inline">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={`part-${q.question_id}-${index}`}>{part.content}</span>;
          } else {
            // Renderizziamo le risposte come testo verde, grassetto e cliccabile
            return (
              <span 
                key={`part-${q.question_id}-${index}`}
                className="text-[#245C4F] font-bold cursor-pointer hover:underline"
                onClick={() => handleQuestionClick(q.question_id)}
              >
                {part.content}
              </span>
            );
          }
        })}
      </span>
    );
  };
  
  // Funzione per renderizzare i placeholder nella domanda
  const renderQuestionPlaceholders = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Aggiungi testo prima del placeholder
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
      }

      const placeholderKey = match[1];
      if (question.placeholders[placeholderKey]) {
        if (question.placeholders[placeholderKey].type === "select") {
          // Renderizza box selezionabile per opzioni
          const placeholder = question.placeholders[placeholderKey];
          parts.push(
            <span 
              key={`placeholder-${placeholderKey}`}
              onClick={() => handlePlaceholderClick(placeholderKey)}
              className="cursor-pointer"
            >
              <SelectPlaceholderBox
                questionId={question.question_id}
                placeholderKey={placeholderKey}
                options={(placeholder as any).options}
              />
            </span>
          );
        } else if (question.placeholders[placeholderKey].type === "input") {
          // Renderizza campo input inline
          const placeholder = question.placeholders[placeholderKey];
          const existingResponse = getResponse(question.question_id, placeholderKey);
          const value = (responses[placeholderKey] as string) || (existingResponse as string) || "";
          
          parts.push(
            <span 
              key={`placeholder-${placeholderKey}`}
              className="inline-block align-middle mx-1"
            >
              <Input
                type={(placeholder as any).input_type || "text"}
                value={value}
                onChange={(e) => handleResponseChange(placeholderKey, e.target.value)}
                placeholder={(placeholder as any).placeholder_label || ""}
                className={cn(
                  "inline-block align-middle text-center",
                  "border-[1.5px] border-[#245C4F] rounded-[8px]",
                  "text-[16px] text-[#222222] font-['Inter']",
                  "h-[48px] px-[12px] py-[10px]",
                  "outline-none focus:ring-0 focus:border-[#245C4F]",
                  "placeholder:text-[#E7E1D9] placeholder:font-normal",
                  {
                    "w-[70px]": (placeholder as any).input_type === "number",
                    "w-[120px]": (placeholder as any).input_type === "text" && (placeholder as any).placeholder_label?.toLowerCase().includes("cap"),
                    "w-[200px]": (placeholder as any).input_type === "text" && !(placeholder as any).placeholder_label?.toLowerCase().includes("cap"),
                  }
                )}
              />
            </span>
          );
        } else {
          parts.push(<span key={`placeholder-${placeholderKey}`} className="mx-1 px-2 py-0.5 bg-gray-100 rounded-md text-[16px]">_____</span>);
        }
      } else {
        parts.push(<span key={`placeholder-${placeholderKey}`} className="mx-1 px-2 py-0.5 bg-gray-100 rounded-md text-[16px]">_____</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Aggiungi il testo rimanente
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  // Renderizza i select options visibili
  const renderVisibleSelectOptions = (key: string, placeholder: any) => {
    const existingResponse = getResponse(question.question_id, key);
    
    if (placeholder.type === "select" && visibleOptions[key]) {
      return (
        <div key={`select-${key}`} className="mt-5">
          <label className="block text-[16px] font-medium text-gray-700 mb-2">
            {placeholder.placeholder_label || "Seleziona un'opzione"}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {placeholder.options.map((option: any) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "text-left px-[18px] py-[12px] border-[1.5px] rounded-[10px] transition-all font-['Inter'] text-[16px] font-normal",
                  "shadow-[0_3px_0_0_#AFA89F] mb-[10px] cursor-pointer w-fit",
                  "hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]",
                  responses[key] === option.id || existingResponse === option.id
                    ? "border-black bg-gray-50"
                    : "border-[#BEB8AE]"
                )}
                onClick={() => handleResponseChange(key, option.id)}
              >
                <div className="font-medium text-black">{option.label}</div>
              </button>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Funzione migliorata per determinare se tutte le input hanno contenuto
  const allInputsHaveContent = () => {
    const inputPlaceholders = Object.keys(question.placeholders).filter(
      key => question.placeholders[key].type === "input"
    );
    
    // Se non ci sono input, consideriamo valido (per gestire select e altri tipi)
    if (inputPlaceholders.length === 0) {
      return true;
    }
    
    // Verifica se tutti gli input hanno un valore
    return inputPlaceholders.every(key => {
      const value = responses[key] || getResponse(question.question_id, key);
      return value !== undefined && value !== "";
    });
  };
  
  // Determina se ci sono risposte valide (modifica per input)
  const hasValidResponses = Object.keys(question.placeholders).some(key => 
    responses[key] !== undefined || getResponse(question.question_id, key) !== undefined
  ) && allInputsHaveContent();

  return (
    <div className="max-w-xl animate-fade-in">
      {/* Testo della domanda semplificato */}
      <div className="text-[16px] font-normal text-gray-900 mb-5 leading-relaxed">
        {renderQuestionText()}
      </div>
      
      {/* Linea separatrice beige */}
      <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />
      
      {/* Contenitore per i select options visibili */}
      <div className="space-y-5">
        {Object.keys(question.placeholders).map(key => renderVisibleSelectOptions(key, question.placeholders[key]))}
      </div>
      
      {/* Pulsante Avanti - mostrato solo se ci sono risposte valide e tutti gli input hanno contenuto */}
      {hasValidResponses && (
        <div className="mt-8">
          <Button
            type="button"
            className={cn(
              "bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[32px] py-[16px] rounded-[12px] text-[17px] font-medium",
              "transition-all shadow-[0_6px_12px_rgba(36,92,79,0.2)] hover:shadow-[0_8px_16px_rgba(36,92,79,0.25)]",
              "inline-flex items-center gap-[12px]"
            )}
            onClick={handleNextQuestion}
            disabled={isNavigating || Object.keys(question.placeholders).length === 0}
          >
            Avanti <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
