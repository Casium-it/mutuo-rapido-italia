
import React, { useState, useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Ripristina le risposte esistenti
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
    
    // Resetta lo stato di navigazione quando la domanda cambia
    setIsNavigating(false);
  }, [question.question_id, getResponse]);

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
      return (
        <div key={`inline-select-${key}`} className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className={
                  (responses[key] === option.id || existingResponse === option.id)
                    ? "bg-black text-white border-black"
                    : "border-gray-300 text-gray-700"
                }
                onClick={() => handleResponseChange(key, option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mt-4">
      <div className="text-base font-medium text-gray-900 mb-3">{question.question_text.replace(/\{\{([^}]+)\}\}/g, '_____')}</div>
      
      {/* Contenitore per tutti i placeholder */}
      <div className="space-y-4">
        {Object.keys(question.placeholders).map(key => renderPlaceholder(key, question.placeholders[key]))}
      </div>
      
      {/* Pulsante Avanti - sempre visibile */}
      <div className="mt-4">
        <Button
          type="button"
          size="sm"
          className="bg-black hover:bg-gray-900 text-white transition-all rounded-lg px-4 py-1 text-sm"
          onClick={handleNextQuestion}
          disabled={isNavigating || Object.keys(question.placeholders).length === 0 || 
                  !Object.keys(question.placeholders).some(key => 
                    responses[key] || getResponse(question.question_id, key))}
        >
          Avanti <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
