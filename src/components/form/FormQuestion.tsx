
import React, { useState, useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

export function FormQuestion({ question }: { question: Question }) {
  const { getResponse, setResponse, navigateToNextQuestion, addActiveBlock } = useForm();
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const params = useParams();

  // Ripristina le risposte se esistono quando la domanda cambia
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

  const renderPlaceholder = (key: string, placeholder: any, inline: boolean = false) => {
    const existingResponse = getResponse(question.question_id, key);
    
    if (placeholder.type === "input") {
      return (
        <div className="mt-4">
          <label htmlFor={`input-${key}`} className="block text-sm font-medium text-gray-700 mb-1">
            {placeholder.placeholder_label}
          </label>
          <Input
            id={`input-${key}`}
            type={placeholder.input_type}
            placeholder={placeholder.placeholder_label}
            value={(responses[key] as string) || (existingResponse as string) || ""}
            onChange={(e) => handleResponseChange(key, e.target.value)}
            className="border-gray-300 focus:border-black focus:ring-0 w-full max-w-md"
          />
        </div>
      );
    } else if (placeholder.type === "select") {
      if (placeholder.multiple) {
        // Handle multi-select (checkboxes) con UI unificata
        return (
          <div key={`multiselect-${key}`} className="flex flex-col space-y-3 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {placeholder.placeholder_label || "Seleziona le opzioni"}
            </label>
            <div className="space-y-2">
              {placeholder.options.map((option) => (
                <label key={option.id} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
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
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      } else {
        // UI unificata per single-select
        return (
          <div key={`select-${key}`} className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {placeholder.placeholder_label || "Seleziona un'opzione"}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {placeholder.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`w-full max-w-md text-left px-5 py-4 border rounded-lg transition-all ${
                    responses[key] === option.id || existingResponse === option.id
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  onClick={() => handleResponseChange(key, option.id)}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
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
      {/* Domanda principale */}
      <div className="text-xl md:text-2xl font-normal text-gray-900 mb-6 leading-relaxed">
        {question.question_text.replace(/\{\{([^}]+)\}\}/g, '_____')}
      </div>
      
      {/* Contenitore per tutti i placeholder */}
      <div className="space-y-6">
        {Object.keys(question.placeholders).map(key => renderPlaceholder(key, question.placeholders[key]))}
      </div>
      
      {/* Pulsante Avanti - sempre visibile */}
      <div className="mt-8">
        <Button
          type="button"
          className="bg-black hover:bg-gray-900 text-white transition-all rounded-lg px-5 py-2 text-sm"
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
