
import React, { useState, useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { Separator } from "@/components/ui/separator";
import { allBlocks } from "@/data/blocks";

interface FormQuestionProps {
  question: Question;
  hideNextButton?: boolean;
}

export function FormQuestion({ 
  question, 
  hideNextButton = false,
}: FormQuestionProps) {
  const { getResponse, setResponse, navigateToNextQuestion, addActiveBlock, goToQuestion, state } = useForm();
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
  const handlePlaceholderClick = (key: string, previousQuestionId?: string) => {
    // Se è fornito un ID di domanda precedente, torna a quella domanda
    if (previousQuestionId) {
      // Trova il blocco della domanda precedente
      const previousBlock = allBlocks.find(block => 
        block.questions.some(q => q.question_id === previousQuestionId)
      );
      
      if (previousBlock && params.blockId) {
        goToQuestion(params.blockId, previousQuestionId, false);
      }
      return;
    }
    
    // Altrimenti gestisci la visibilità delle opzioni
    setVisibleOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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

  // Funzione per trovare la domanda precedente per una domanda inline
  const findPreviousQuestion = () => {
    if (!question.inline) return null;
    
    // Cerca il blocco corrente
    const currentBlock = allBlocks.find(block => 
      block.questions.some(q => q.question_id === question.question_id)
    );
    if (!currentBlock) return null;
    
    // Controlla tutte le domande nel blocco per trovare quella che porta a questa domanda
    for (const q of currentBlock.questions) {
      for (const key of Object.keys(q.placeholders)) {
        const placeholder = q.placeholders[key];
        
        if (placeholder.type === "select") {
          const options = (placeholder as any).options;
          for (const opt of options) {
            if (opt.leads_to === question.question_id) {
              return {
                question: q,
                placeholderKey: key,
                optionId: opt.id
              };
            }
          }
        } else if (placeholder.type === "input") {
          if ((placeholder as any).leads_to === question.question_id) {
            return {
              question: q,
              placeholderKey: key,
              inputValue: getResponse(q.question_id, key)
            };
          }
        }
      }
    }
    
    return null;
  };

  // Ottiene il testo della selezione precedente
  const getPreviousSelectionText = (previousInfo: any) => {
    if (!previousInfo) return "";
    
    const { question, placeholderKey, optionId, inputValue } = previousInfo;
    
    if (optionId) {
      const options = (question.placeholders[placeholderKey] as any).options;
      const selectedOption = options.find((opt: any) => opt.id === optionId);
      return selectedOption?.label || "";
    } else if (inputValue) {
      return Array.isArray(inputValue) ? inputValue.join(", ") : String(inputValue);
    }
    
    return "";
  };

  // Funzione per renderizzare il testo della domanda con la gestione corretta delle domande inline
  const renderQuestionText = () => {
    // Se è una domanda inline, trova la domanda precedente
    const previousInfo = question.inline ? findPreviousQuestion() : null;
    
    // Se non ci sono informazioni precedenti o non è una domanda inline, renderizza normalmente
    if (!previousInfo || !question.inline) {
      return renderNormalQuestionText(question.question_text);
    }
    
    // Ottieni il testo della domanda precedente
    const previousQuestionText = previousInfo.question.question_text;
    const previousSelectionText = getPreviousSelectionText(previousInfo);
    const previousQuestionId = previousInfo.question.question_id;
    
    // Costruisci un array di parti per il rendering
    const parts = [];
    
    // Sostituisci il placeholder nella domanda precedente con la selezione cliccabile
    const placeholderPattern = new RegExp(`\\{\\{${previousInfo.placeholderKey}\\}\\}`, 'g');
    const textBeforePlaceholder = previousQuestionText.split(placeholderPattern)[0];
    const textAfterPlaceholder = previousQuestionText.split(placeholderPattern)[1] || '';
    
    // Aggiungi il testo prima del placeholder
    parts.push(<span key="text-previous-before">{textBeforePlaceholder}</span>);
    
    // Aggiungi la selezione precedente come elemento cliccabile
    parts.push(
      <span 
        key="placeholder-previous"
        onClick={() => handlePlaceholderClick("", previousQuestionId)}
        className="inline-flex items-center justify-center mx-1 bg-[#F8F4EF] text-[#245C4F] font-semibold px-[10px] py-[4px] rounded-[6px] text-[16px] cursor-pointer hover:bg-[#E7E1D9]"
      >
        {previousSelectionText}
      </span>
    );
    
    // Aggiungi il testo dopo il placeholder
    parts.push(<span key="text-previous-after">{textAfterPlaceholder} </span>);
    
    // Aggiungi il testo della domanda corrente
    const currentParts = renderNormalQuestionText(question.question_text);
    parts.push(<span key="current-question">{currentParts}</span>);
    
    return <>{parts}</>;
  };

  // Funzione per renderizzare una domanda normale (testo con placeholders)
  const renderNormalQuestionText = (questionText: string) => {
    if (!questionText.includes('{{')) {
      return <span>{questionText}</span>;
    }

    const parts = [];
    let lastIndex = 0;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(questionText)) !== null) {
      // Aggiungi testo prima del placeholder
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{questionText.slice(lastIndex, match.index)}</span>);
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
    if (lastIndex < questionText.length) {
      parts.push(<span key={`text-${lastIndex}`}>{questionText.slice(lastIndex)}</span>);
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
            {placeholder.options.map((option) => (
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

  // Determina se ci sono risposte valide
  const hasValidResponses = Object.keys(question.placeholders).some(key => 
    responses[key] !== undefined || getResponse(question.question_id, key) !== undefined
  );

  // Verifica se questa domanda ha domande inline di follow-up
  const hasInlineFollowUp = () => {
    const mainKey = Object.keys(question.placeholders)[0];
    if (!mainKey) return false;
    
    const response = state.responses[question.question_id]?.[mainKey];
    if (!response) return false;
    
    let nextQuestionId;
    
    if (question.placeholders[mainKey].type === "select" && !Array.isArray(response)) {
      const options = (question.placeholders[mainKey] as any).options;
      const selectedOption = options.find((opt: any) => opt.id === response);
      nextQuestionId = selectedOption?.leads_to;
    } else if (question.placeholders[mainKey].type === "input") {
      nextQuestionId = (question.placeholders[mainKey] as any).leads_to;
    }
    
    if (!nextQuestionId || nextQuestionId === "next_block") return false;
    
    // Cerca se la prossima domanda è inline
    const currentBlock = allBlocks.find(block => 
      block.questions.some(q => q.question_id === question.question_id)
    );
    
    if (!currentBlock) return false;
    
    const nextQuestion = currentBlock.questions.find(q => q.question_id === nextQuestionId);
    return nextQuestion?.inline === true;
  };

  return (
    <div className="max-w-xl animate-fade-in">
      {/* Domanda con gestione avanzata delle inline */}
      <div className="text-[16px] font-normal text-gray-900 mb-5 leading-relaxed">
        {renderQuestionText()}
      </div>
      
      {/* Linea separatrice beige */}
      <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />
      
      {/* Contenitore per i select options visibili */}
      <div className="space-y-5">
        {Object.keys(question.placeholders).map(key => renderVisibleSelectOptions(key, question.placeholders[key]))}
      </div>
      
      {/* Pulsante Avanti - mostrato solo se ci sono risposte valide, hideNextButton è false, e non ci sono domande inline di follow-up */}
      {!hideNextButton && hasValidResponses && !hasInlineFollowUp() && (
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
