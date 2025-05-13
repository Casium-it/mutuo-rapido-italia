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

export function FormQuestion({ question }: { question: Question }) {
  const { getResponse, setResponse, navigateToNextQuestion, addActiveBlock } = useForm();
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const params = useParams();
  const location = useLocation();

  // Ripristina le risposte se esistono quando la domanda cambia o l'URL cambia
  useEffect(() => {
    const existingResponses: { [key: string]: string | string[] } = {};
    Object.keys(question.placeholders).forEach(key => {
      const existingResponse = getResponse(question.question_id, key);
      if (existingResponse) {
        existingResponses[key] = existingResponse;
      }
    });
    
    if (Object.keys(existingResponses).length > 0) {
      setResponses(existingResponses);
    } else {
      setResponses({});
    }
    
    // Resetta lo stato di navigazione quando la domanda cambia o l'URL cambia
    setIsNavigating(false);
  }, [question.question_id, getResponse, location.pathname]);

  // Funzione per gestire il cambio di risposta senza navigazione automatica
  const handleResponseChange = (key: string, value: string | string[]) => {
    setResponses({
      ...responses,
      [key]: value
    });
    
    // Salviamo subito la risposta nel contesto globale
    setResponse(question.question_id, key, value);
    
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

  // Nuovo metodo per renderizzare il testo con i placeholder come box
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
          <SelectPlaceholderBox
            key={`placeholder-${placeholderKey}`}
            questionId={question.question_id}
            placeholderKey={placeholderKey}
            options={(placeholder as any).options}
          />
        );
      } else {
        // Fallback per altri tipi di placeholder o se la chiave non esiste
        parts.push(<span key={`placeholder-${placeholderKey}`} className="mx-1 px-2 py-0.5 bg-gray-100 rounded-md text-[16px]">_____</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Aggiungi il testo rimanente dopo l'ultimo placeholder
    if (lastIndex < question.question_text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{question.question_text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  const renderPlaceholder = (key: string, placeholder: any, inline: boolean = false) => {
    const existingResponse = getResponse(question.question_id, key);
    
    if (placeholder.type === "input") {
      return (
        <div className="mt-5">
          <label htmlFor={`input-${key}`} className="block text-[16px] font-medium text-gray-700 mb-2">
            {placeholder.placeholder_label}
          </label>
          <Input
            id={`input-${key}`}
            type={placeholder.input_type}
            placeholder={placeholder.placeholder_label}
            value={(responses[key] as string) || (existingResponse as string) || ""}
            onChange={(e) => handleResponseChange(key, e.target.value)}
            className="border-gray-300 focus:border-black focus:ring-0 w-full max-w-md text-[16px]"
          />
        </div>
      );
    } else if (placeholder.type === "select") {
      if (placeholder.multiple) {
        // Handle multi-select (checkboxes) con UI unificata
        return (
          <div key={`multiselect-${key}`} className="flex flex-col space-y-3 mt-5">
            <label className="block text-[16px] font-medium text-gray-700 mb-2">
              {placeholder.placeholder_label || "Seleziona le opzioni"}
            </label>
            <div className="space-y-2">
              {placeholder.options.map((option) => (
                <label 
                  key={option.id} 
                  className={cn(
                    "flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer",
                    "font-['Inter'] border-[#BEB8AE] rounded-[10px] shadow-[0_3px_0_0_#AFA89F] mb-[10px]",
                    "hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={
                      (responses[key] as string[] || existingResponse as string[] || []).includes(
                        option.id
                      )
                    }
                    onChange={(e) => {
                      const current = (responses[key] as string[]) || (existingResponse as string[]) || [];
                      const newValue = e.target.checked
                        ? [...current, option.id]
                        : current.filter((id) => id !== option.id);
                      handleResponseChange(key, newValue);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-gray-700 text-[16px]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      } else {
        // UI unificata per single-select con nuovo stile
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
    }
    return null;
  };

  // Renderizza la domanda principale con UI unificata
  return (
    <div className="max-w-xl animate-fade-in">
      {/* Domanda principale - aggiornato per utilizzare renderQuestionText */}
      <div className="text-[16px] font-normal text-gray-900 mb-5 leading-relaxed">
        {renderQuestionText()}
      </div>
      
      {/* Linea separatrice beige */}
      <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />
      
      {/* Contenitore per tutti i placeholder */}
      <div className="space-y-5">
        {Object.keys(question.placeholders).map(key => renderPlaceholder(key, question.placeholders[key]))}
      </div>
      
      {/* Pulsante Avanti - con lo stile aggiornato */}
      <div className="mt-8">
        <Button
          type="button"
          className={cn(
            "bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[32px] py-[16px] rounded-[12px] text-[17px] font-medium",
            "transition-all shadow-[0_6px_12px_rgba(36,92,79,0.2)] hover:shadow-[0_8px_16px_rgba(36,92,79,0.25)]",
            "inline-flex items-center gap-[12px]"
          )}
          onClick={handleNextQuestion}
          disabled={isNavigating || Object.keys(question.placeholders).length === 0 || 
                  !Object.keys(question.placeholders).some(key => 
                    responses[key] || getResponse(question.question_id, key))}
        >
          Avanti <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
