
import React, { useState } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  // Funzione per gestire il salvataggio delle risposte e la navigazione
  const handleResponseAndNavigation = (key: string, value: string | string[]) => {
    // Salva immediatamente la risposta nel contesto globale
    setResponse(question.question_id, key, value);
    
    // Gestisci la navigazione per le risposte di tipo select
    if (question.placeholders[key].type === "select" && !Array.isArray(value)) {
      const selectedOption = (question.placeholders[key] as any).options.find(
        (opt: any) => opt.id === value
      );
      
      if (selectedOption?.add_block) {
        addActiveBlock(selectedOption.add_block);
      }
      
      // Naviga alla prossima domanda
      if (selectedOption?.leads_to) {
        navigateToNextQuestion(question.question_id, selectedOption.leads_to);
        return true;
      }
    } else if (question.placeholders[key].type === "input" && (question.placeholders[key] as any).leads_to) {
      navigateToNextQuestion(question.question_id, (question.placeholders[key] as any).leads_to);
      return true;
    }
    
    return false;
  };

  // Trova l'etichetta dell'opzione selezionata nella domanda precedente
  const findSelectedOptionLabel = () => {
    if (!previousResponse) return "";
    
    const placeholderKey = Object.keys(previousQuestion.placeholders)[0];
    if (!placeholderKey) return "";
    
    const placeholder = previousQuestion.placeholders[placeholderKey];
    if (placeholder.type !== "select") return previousResponse;
    
    const selectedOption = placeholder.options.find(opt => opt.id === previousResponse);
    return selectedOption ? selectedOption.label : "";
  };

  const renderPlaceholder = (key: string, placeholder: any) => {
    const existingResponse = getResponse(question.question_id, key);
    
    if (placeholder.type === "input") {
      return (
        <Input
          type={placeholder.input_type}
          placeholder={placeholder.placeholder_label}
          value={(responses[key] as string) || (existingResponse as string) || ""}
          onChange={(e) => {
            setResponses({
              ...responses,
              [key]: e.target.value
            });
          }}
          className="inline-block mx-1 w-auto min-w-[80px] border-black"
        />
      );
    } else if (placeholder.type === "select") {
      return (
        <div className="inline-flex gap-2 mx-1">
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
                  : "border-gray-300"
              }
              onClick={() => {
                // Aggiorna lo stato locale
                const newValue = option.id;
                setResponses({
                  ...responses,
                  [key]: newValue
                });
                
                // Gestisci salvataggio e navigazione automatici
                handleResponseAndNavigation(key, newValue);
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Salva tutte le risposte
    for (const [key, value] of Object.entries(responses)) {
      if (value) {
        handleResponseAndNavigation(key, value);
      }
    }
  };

  // Funzione migliorata per renderizzare il testo della domanda inline con i placeholders
  const renderInlineQuestionText = () => {
    let result = question.question_text;
    
    // Sostituisci tutti i placeholder nel testo
    Object.keys(question.placeholders).forEach(key => {
      const placeholder = `{{${key}}}`;
      const replacementComponent = renderPlaceholder(key, question.placeholders[key]);
      if (replacementComponent) {
        result = result.replace(placeholder, `___PLACEHOLDER_${key}___`);
      }
    });
    
    // Dividi il testo in base ai placeholder
    const parts = result.split(/___PLACEHOLDER_([^_]+)___/);
    
    // Costruisci l'array di elementi React
    return parts.map((part, index) => {
      // Se è un indice dispari, è un riferimento a un placeholder
      if (index % 2 === 1) {
        const placeholderKey = part;
        return renderPlaceholder(placeholderKey, question.placeholders[placeholderKey]);
      }
      // Altrimenti è testo normale
      return part;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="inline">
      <span className="text-lg font-medium">{renderInlineQuestionText()}</span>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="ml-2 text-black hover:text-gray-700"
        disabled={Object.keys(responses).length === 0}
      >
        OK
      </Button>
    </form>
  );
}
