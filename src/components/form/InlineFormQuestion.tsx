
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
  const [isNavigating, setIsNavigating] = useState(false);

  // Funzione per gestire il salvataggio delle risposte e la navigazione
  const handleResponseAndNavigation = (key: string, value: string | string[]) => {
    // Previeni la navigazione se è già in corso
    if (isNavigating) return false;
    
    // Imposta lo stato di navigazione
    setIsNavigating(true);
    
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
        setTimeout(() => {
          navigateToNextQuestion(question.question_id, selectedOption.leads_to);
          setIsNavigating(false);
        }, 50);
        return true;
      }
    } else if (question.placeholders[key].type === "input" && (question.placeholders[key] as any).leads_to) {
      setTimeout(() => {
        navigateToNextQuestion(question.question_id, (question.placeholders[key] as any).leads_to);
        setIsNavigating(false);
      }, 50);
      return true;
    }
    
    setIsNavigating(false);
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
          key={`input-${key}`}
          type={placeholder.input_type}
          placeholder={placeholder.placeholder_label}
          value={(responses[key] as string) || (existingResponse as string) || ""}
          onChange={(e) => {
            setResponses({
              ...responses,
              [key]: e.target.value
            });
          }}
          className="inline-block mx-1 w-auto min-w-[80px] border-gray-300 focus:border-black focus:ring-0"
        />
      );
    } else if (placeholder.type === "select") {
      return (
        <div key={`select-${key}`} className="inline-flex gap-1 mx-1">
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
                  ? "bg-black text-white border-black text-xs"
                  : "border-gray-300 text-gray-700 text-xs"
              }
              onClick={() => {
                if (isNavigating) return;
                
                // Aggiorna lo stato locale
                const newValue = option.id;
                setResponses({
                  ...responses,
                  [key]: newValue
                });
                
                // Gestisci salvataggio e navigazione automatici
                handleResponseAndNavigation(key, newValue);
              }}
              disabled={isNavigating}
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
    
    // Previeni l'invio se è già in corso una navigazione
    if (isNavigating) return;
    
    // Imposta lo stato di navigazione
    setIsNavigating(true);
    
    // Salva tutte le risposte
    let hasNavigated = false;
    
    setTimeout(() => {
      for (const [key, value] of Object.entries(responses)) {
        if (value) {
          setResponse(question.question_id, key, value);
          
          // Controlla se è necessario navigare
          if (handleResponseAndNavigation(key, value)) {
            hasNavigated = true;
            break;
          }
        }
      }
      
      if (!hasNavigated) {
        setIsNavigating(false);
      }
    }, 50);
  };

  // Funzione migliorata per renderizzare il testo della domanda inline con i placeholders
  const renderInlineQuestionText = () => {
    // Create a copy of the question text to work with
    let text = question.question_text;
    const placeholders = {};
    
    // First, replace all placeholders with unique markers
    Object.keys(question.placeholders).forEach((key, index) => {
      const placeholder = `{{${key}}}`;
      const marker = `__PLACEHOLDER_${index}_${key}__`;
      placeholders[marker] = key;
      text = text.replace(new RegExp(placeholder, 'g'), marker);
    });
    
    // Split by all markers at once using regex
    const allMarkers = Object.keys(placeholders).join('|').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = allMarkers ? text.split(new RegExp(`(${allMarkers})`, 'g')) : [text];
    
    // Map the parts to React nodes
    return parts.map((part, index) => {
      if (placeholders[part]) {
        // This part is a placeholder marker
        const key = placeholders[part];
        return renderPlaceholder(key, question.placeholders[key]);
      }
      // This part is regular text
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="inline">
      <span className="text-base font-normal text-gray-900">{renderInlineQuestionText()}</span>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="ml-1 text-gray-700 hover:text-gray-900 p-1 h-auto"
        disabled={Object.keys(responses).length === 0 || isNavigating}
      >
        OK
      </Button>
    </form>
  );
}
