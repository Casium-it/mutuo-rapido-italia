import React, { useState } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

  // Funzione per determinare se un placeholder è alla fine della domanda
  const isPlaceholderAtEnd = (questionText: string, placeholderKey: string): boolean => {
    const placeholder = `{{${placeholderKey}}}`;
    return questionText.trim().endsWith(placeholder);
  };

  const renderPlaceholder = (key: string, placeholder: any, inline: boolean = true) => {
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
          className={cn(
            "border-gray-300 focus:border-black focus:ring-0",
            inline ? "inline-block mx-1 w-28 min-w-[80px]" : "w-full max-w-md mt-2"
          )}
        />
      );
    } else if (placeholder.type === "select") {
      if (inline) {
        // Versione inline per placeholder
        return (
          <span key={`select-inline-${key}`} className="inline-flex gap-1 mx-1">
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="border-gray-300 bg-white text-gray-500 text-xs font-normal"
            >
              Seleziona
            </Button>
          </span>
        );
      }
      
      // Versione non inline con opzioni
      return (
        <div key={`select-${key}`} className="inline-flex flex-wrap gap-1 mx-1">
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
    if (!question.question_text.includes('{{')) {
      return <span>{question.question_text}</span>;
    }
    
    // Trova tutti i placeholder e la loro posizione
    const placeholders = [];
    const placeholderRegex = /\{\{([^}]+)\}\}/g;
    let match;
    let questionText = question.question_text;
    
    while ((match = placeholderRegex.exec(questionText)) !== null) {
      placeholders.push({
        key: match[1],
        position: match.index,
        length: match[0].length,
        isAtEnd: match.index + match[0].length >= questionText.length - 1
      });
    }

    // Se ci sono placeholder ma non sono alla fine, mostra il testo e i select sotto
    if (placeholders.length > 0 && !placeholders[placeholders.length - 1].isAtEnd) {
      // Replace placeholders with "Seleziona" buttons in the text
      let parts = [];
      let lastIndex = 0;
      
      placeholders.forEach((placeholder, index) => {
        // Add text before the placeholder
        if (placeholder.position > lastIndex) {
          parts.push({
            type: 'text',
            content: questionText.substring(lastIndex, placeholder.position)
          });
        }
        
        // Add the placeholder as a button
        if (question.placeholders[placeholder.key]) {
          parts.push({
            type: 'placeholder',
            key: placeholder.key,
            isInline: true
          });
        } else {
          parts.push({
            type: 'text',
            content: questionText.substring(placeholder.position, 
                                           placeholder.position + placeholder.length)
          });
        }
        
        lastIndex = placeholder.position + placeholder.length;
      });
      
      // Add remaining text
      if (lastIndex < questionText.length) {
        parts.push({
          type: 'text',
          content: questionText.substring(lastIndex)
        });
      }
      
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center">
            {parts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={`text-${index}`}>{part.content}</span>;
              } else {
                // Render placeholder as a button
                return (
                  <span key={`placeholder-${index}`}>
                    {renderPlaceholder(part.key, question.placeholders[part.key], true)}
                  </span>
                );
              }
            })}
          </div>
          
          {/* Render select options below for each placeholder */}
          <div className="mt-1 ml-4">
            {placeholders.map(placeholder => (
              <div key={`select-options-${placeholder.key}`} className="mt-2">
                {question.placeholders[placeholder.key] && 
                  renderPlaceholder(placeholder.key, question.placeholders[placeholder.key], false)}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Split the question text by placeholder patterns
    const parts = [];
    let lastIndex = 0;
    const placeholderRegexForRender = /\{\{([^}]+)\}\}/g;
    let placeholderMatch;
    
    // Trova tutti i placeholder nel testo
    while ((placeholderMatch = placeholderRegexForRender.exec(question.question_text)) !== null) {
      const matchStart = placeholderMatch.index;
      const matchEnd = placeholderMatch.index + placeholderMatch[0].length;
      const placeholderKey = placeholderMatch[1];
      
      // Aggiungi il testo prima del placeholder
      if (matchStart > lastIndex) {
        parts.push({
          type: 'text',
          content: question.question_text.substring(lastIndex, matchStart)
        });
      }
      
      // Aggiungi il placeholder
      if (question.placeholders[placeholderKey]) {
        parts.push({
          type: 'placeholder',
          key: placeholderKey
        });
      } else {
        // Se il placeholder non esiste, mantieni il testo originale
        parts.push({
          type: 'text',
          content: placeholderMatch[0]
        });
      }
      
      lastIndex = matchEnd;
    }
    
    // Aggiungi il resto del testo dopo l'ultimo placeholder
    if (lastIndex < question.question_text.length) {
      parts.push({
        type: 'text',
        content: question.question_text.substring(lastIndex)
      });
    }
    
    // Rendering delle parti
    return parts.map((part, index) => {
      if (part.type === 'text') {
        return <span key={`text-${index}`}>{part.content}</span>;
      } else {
        // Renderizza l'input o il select per questo placeholder
        return <span key={`placeholder-${index}`}>{renderPlaceholder(part.key, question.placeholders[part.key])}</span>;
      }
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
