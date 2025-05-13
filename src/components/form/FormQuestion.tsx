
import React, { useState, useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useParams, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { Separator } from "@/components/ui/separator";

interface FormQuestionProps {
  question: Question;
  hideNextButton?: boolean;
  isInlineQuestion?: boolean;
  previousQuestionId?: string;
  previousPlaceholderKey?: string;
  previousResponse?: string | string[];
}

export function FormQuestion({ 
  question, 
  hideNextButton = false,
  isInlineQuestion = false,
  previousQuestionId,
  previousPlaceholderKey,
  previousResponse
}: FormQuestionProps) {
  const { getResponse, setResponse, navigateToNextQuestion, addActiveBlock, goToQuestion } = useForm();
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  // Stato per tenere traccia di quali placeholder hanno opzioni visibili
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  const params = useParams();
  const location = useLocation();

  // Ripristina le risposte se esistono quando la domanda cambia o l'URL cambia
  useEffect(() => {
    const existingResponses: { [key: string]: string | string[] } = {};
    const initialVisibleOptions: { [key: string]: boolean } = {};
    
    Object.keys(question.placeholders).forEach(key => {
      const existingResponse = getResponse(question.question_id, key);
      if (existingResponse) {
        existingResponses[key] = existingResponse;
        // Se esiste già una risposta, inizialmente nascondi le opzioni
        initialVisibleOptions[key] = false;
      } else {
        // Se non esiste una risposta, mostra le opzioni
        initialVisibleOptions[key] = true;
      }
    });
    
    if (Object.keys(existingResponses).length > 0) {
      setResponses(existingResponses);
    } else {
      setResponses({});
    }
    
    setVisibleOptions(initialVisibleOptions);
    
    // Resetta lo stato di navigazione quando la domanda cambia o l'URL cambia
    setIsNavigating(false);
  }, [question.question_id, getResponse, location.pathname]);

  // Funzione per gestire il cambio di risposta e nascondere le opzioni dopo la selezione
  const handleResponseChange = (key: string, value: string | string[]) => {
    setResponses({
      ...responses,
      [key]: value
    });
    
    // Salviamo subito la risposta nel contesto globale
    setResponse(question.question_id, key, value);
    
    // Nascondi le opzioni dopo la selezione
    setVisibleOptions(prev => ({
      ...prev,
      [key]: false
    }));
    
    // Gestiamo l'attivazione di blocchi aggiuntivi
    if (question.placeholders[key].type === "select" && !Array.isArray(value)) {
      const selectedOption = (question.placeholders[key] as any).options.find(
        (opt: any) => opt.id === value
      );
      
      if (selectedOption?.add_block) {
        addActiveBlock(selectedOption.add_block);
      }
    }
  };

  // Funzione per gestire il click sul placeholder e mostrare di nuovo le opzioni
  const handlePlaceholderClick = (key: string) => {
    // Se è un placeholder che rappresenta una selezione precedente, torniamo a quella domanda
    if (isInlineQuestion && key === "previous_selection" && previousQuestionId) {
      // Naviga indietro alla domanda precedente
      goToQuestion(params.blockId || "", previousQuestionId, false);
      return;
    }
    
    setVisibleOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Funzione per avanzare manualmente alla prossima domanda
  const handleNextQuestion = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Cerca se c'è un leads_to specifico per le risposte date
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
    
    // Se non c'è un leads_to specifico, vai al prossimo blocco
    setTimeout(() => {
      navigateToNextQuestion(question.question_id, "next_block");
      setIsNavigating(false);
    }, 50);
  };

  // Funzione per ottenere il testo della selezione precedente
  const getPreviousSelectionText = (): string => {
    if (!isInlineQuestion || !previousQuestionId || !previousPlaceholderKey || previousResponse === undefined) {
      return "";
    }
    
    // Se il tipo della risposta precedente è "select", otteni il testo dell'opzione selezionata
    if (!Array.isArray(previousResponse)) {
      const blocks = window.formBlocks || [];
      const allBlocks = blocks.flatMap(block => block);
      const previousQuestionBlock = allBlocks.find(block => 
        block.questions.some(q => q.question_id === previousQuestionId)
      );
      
      if (previousQuestionBlock) {
        const prevQuestion = previousQuestionBlock.questions.find(q => q.question_id === previousQuestionId);
        
        if (prevQuestion && prevQuestion.placeholders[previousPlaceholderKey].type === "select") {
          const options = (prevQuestion.placeholders[previousPlaceholderKey] as any).options;
          const selectedOption = options.find((opt: any) => opt.id === previousResponse);
          
          if (selectedOption) {
            return selectedOption.label;
          }
        }
      }
      
      return previousResponse.toString();
    }
    
    // Se è un array (multiple select), unisci i valori con virgole
    return Array.isArray(previousResponse) ? previousResponse.join(", ") : previousResponse.toString();
  };

  // Metodo per renderizzare il testo con i placeholder come input o select box
  const renderQuestionText = () => {
    // Se è una domanda inline, aggiungi la selezione precedente prima del testo della domanda
    let questionText = question.question_text;
    const previousSelectionText = getPreviousSelectionText();
    
    if (isInlineQuestion && previousSelectionText) {
      // Aggiungi la selezione precedente come elemento cliccabile
      return (
        <>
          <span 
            onClick={() => previousQuestionId && handlePlaceholderClick("previous_selection")}
            className="inline-flex items-center justify-center mr-1 bg-[#F8F4EF] text-[#245C4F] font-semibold px-[10px] py-[4px] rounded-[6px] text-[16px] cursor-pointer hover:bg-[#E7E1D9]"
          >
            {previousSelectionText}
          </span>
          {renderQuestionTextWithPlaceholders(questionText)}
        </>
      );
    }
    
    return renderQuestionTextWithPlaceholders(questionText);
  };
  
  // Helper per renderizzare il testo con i placeholder
  const renderQuestionTextWithPlaceholders = (text: string) => {
    if (!text.includes('{{')) {
      return <span>{text}</span>;
    }

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
          // Fallback per altri tipi di placeholder o se la chiave non esiste
          parts.push(<span key={`placeholder-${placeholderKey}`} className="mx-1 px-2 py-0.5 bg-gray-100 rounded-md text-[16px]">_____</span>);
        }
      } else {
        // Fallback se la chiave non esiste nei placeholders
        parts.push(<span key={`placeholder-${placeholderKey}`} className="mx-1 px-2 py-0.5 bg-gray-100 rounded-md text-[16px]">_____</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Aggiungi il testo rimanente dopo l'ultimo placeholder
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  // Ora renderizziamo solo i placeholder select con opzioni visibili sotto la domanda
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

  // Determina se ci sono risposte valide per mostrare il pulsante Avanti
  const hasValidResponses = Object.keys(question.placeholders).some(key => 
    responses[key] !== undefined || getResponse(question.question_id, key) !== undefined
  );

  // Renderizza la domanda principale con UI unificata
  return (
    <div className="max-w-xl animate-fade-in">
      {/* Domanda - aggiornato per utilizzare renderQuestionText */}
      <div className="text-[16px] font-normal text-gray-900 mb-5 leading-relaxed">
        {renderQuestionText()}
      </div>
      
      {/* Linea separatrice beige */}
      <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />
      
      {/* Contenitore per i select options visibili */}
      <div className="space-y-5">
        {Object.keys(question.placeholders).map(key => renderVisibleSelectOptions(key, question.placeholders[key]))}
      </div>
      
      {/* Pulsante Avanti - con lo stile aggiornato - mostrato solo se ci sono risposte valide e hideNextButton è false */}
      {!hideNextButton && hasValidResponses && (
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
