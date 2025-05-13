
import React, { useState, useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { Separator } from "@/components/ui/separator";

interface InlineFormQuestionProps {
  question: Question;
  previousQuestion: Question;
  previousResponse: string | string[] | undefined;
}

export function InlineFormQuestion({ 
  question, 
  previousQuestion, 
  previousResponse 
}: InlineFormQuestionProps) {
  const { getResponse, setResponse, navigateToNextQuestion, addActiveBlock } = useForm();
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  // Nuovo stato per tenere traccia di quali placeholder hanno opzioni visibili
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();

  // Ripristina le risposte esistenti e resetta lo stato quando cambia l'URL
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

  // Metodo per renderizzare il testo con i placeholder come box cliccabili
  const renderQuestionText = () => {
    if (!question.question_text.includes('{{')) {
      return <span>{question.question_text}</span>;
    }

    const parts = [];
    let lastIndex = 0;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(question.question_text)) !== null) {
      // Aggiungi testo prima del placeholder
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{question.question_text.slice(lastIndex, match.index)}</span>);
      }

      const placeholderKey = match[1];
      if (question.placeholders[placeholderKey] && question.placeholders[placeholderKey].type === "select") {
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
              className="text-[16px] py-0"
            />
          </span>
        );
      } else {
        // Fallback per altri tipi di placeholder o se la chiave non esiste
        parts.push(<span key={`placeholder-${placeholderKey}`} className="mx-1 px-1 py-0 bg-gray-100 rounded text-[16px]">_____</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Aggiungi il testo rimanente dopo l'ultimo placeholder
    if (lastIndex < question.question_text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{question.question_text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  const renderPlaceholder = (key: string, placeholder: any) => {
    const existingResponse = getResponse(question.question_id, key);
    
    if (placeholder.type === "input") {
      return (
        <div className="mt-3">
          <label htmlFor={`inline-input-${key}`} className="block text-sm font-medium text-gray-700 mb-1">
            {placeholder.placeholder_label}
          </label>
          <Input
            id={`inline-input-${key}`}
            type={placeholder.input_type}
            placeholder={placeholder.placeholder_label}
            value={(responses[key] as string) || (existingResponse as string) || ""}
            onChange={(e) => handleResponseChange(key, e.target.value)}
            className="border-gray-300 focus:border-black focus:ring-0 w-full"
          />
        </div>
      );
    } else if (placeholder.type === "select") {
      // Determina se le opzioni dovrebbero essere visibili
      const hasResponse = (responses[key] !== undefined) || (existingResponse !== undefined);
      const shouldShowOptions = visibleOptions[key] || !hasResponse;
      
      if (!shouldShowOptions) {
        return null; // Non mostrare nulla se le opzioni sono nascoste
      }
      
      return (
        <div key={`inline-select-${key}`} className="mt-4">
          <label className="block text-[16px] font-medium text-gray-700 mb-2">
            {placeholder.placeholder_label || "Seleziona un'opzione"}
          </label>
          <div className="flex flex-wrap gap-2">
            {placeholder.options.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={
                  (responses[key] === option.id || existingResponse === option.id)
                    ? "default"
                    : "outline"
                }
                size="sm"
                className={cn(
                  "text-[16px] font-normal",
                  (responses[key] === option.id || existingResponse === option.id)
                    ? "bg-black text-white border-black"
                    : "border-[#BEB8AE] text-gray-700 hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)] hover:bg-white"
                )}
                onClick={() => handleResponseChange(key, option.id)}
              >
                {option.label}
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

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mt-4">
      {/* Domanda - aggiornata per utilizzare renderQuestionText */}
      <div className="text-[16px] font-medium text-gray-900 mb-4">
        {renderQuestionText()}
      </div>
      
      {/* Linea separatrice beige */}
      <Separator className="h-[1px] bg-[#F0EAE0] my-4" />
      
      {/* Contenitore per tutti i placeholder */}
      <div className="space-y-4 mt-4">
        {Object.keys(question.placeholders).map(key => renderPlaceholder(key, question.placeholders[key]))}
      </div>
      
      {/* Pulsante Avanti - mostrato solo se ci sono risposte valide */}
      {hasValidResponses && (
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
            disabled={isNavigating || Object.keys(question.placeholders).length === 0}
          >
            Avanti <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
