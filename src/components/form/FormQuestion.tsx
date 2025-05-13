import React, { useState, useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
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

  // Funzione per gestire il salvataggio delle risposte e la navigazione
  const handleResponseAndNavigation = async (key: string, value: string | string[]) => {
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

  const renderPlaceholder = (key: string, placeholder: any, inline: boolean = false) => {
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
            inline ? "inline-block mx-1 w-32 min-w-[120px]" : "w-full max-w-md mt-2"
          )}
        />
      );
    } else if (placeholder.type === "select") {
      if (placeholder.multiple) {
        // Handle multi-select (checkboxes)
        return (
          <div key={`multiselect-${key}`} className="flex flex-col space-y-3 mt-4">
            {placeholder.options.map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
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
                    setResponses({
                      ...responses,
                      [key]: newValue
                    });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      } else {
        // Handle single select (buttons) con il design "Seleziona"
        if (inline) {
          // Versione inline per placeholder in qualsiasi posizione della frase
          const selectedOption = placeholder.options.find(
            (opt: any) => opt.id === (responses[key] || existingResponse)
          );

          return (
            <button
              key={`select-inline-${key}`}
              type="button"
              className="inline-flex items-center justify-between mx-1 px-3 py-1.5 border border-gray-300 
                        rounded bg-white text-gray-700 hover:border-gray-400 text-sm transition-all min-w-[100px]"
              onClick={() => {}}
            >
              <span>{selectedOption ? selectedOption.label : "Seleziona"}</span>
              <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-70" />
            </button>
          );
        }
        
        // Versione normale con opzioni sotto
        return (
          <div key={`select-${key}`} className="grid grid-cols-1 gap-2 mt-4">
            {placeholder.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`w-full max-w-md text-left px-5 py-4 border rounded-lg transition-all ${
                  responses[key] === option.id || existingResponse === option.id
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => {
                  if (isNavigating) return;
                  
                  // Aggiorna lo stato locale
                  const newValue = option.id;
                  setResponses({
                    ...responses,
                    [key]: newValue
                  });
                  
                  // Gestisci salvataggio e navigazione automatici per singola selezione
                  handleResponseAndNavigation(key, newValue);
                }}
                disabled={isNavigating}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
              </button>
            ))}
          </div>
        );
      }
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
    let hasResponsesToSave = false;
    
    for (const [key, value] of Object.entries(responses)) {
      if (value) {
        hasResponsesToSave = true;
        setResponse(question.question_id, key, value);
      }
    }
    
    setTimeout(() => {
      // Se non ci sono risposte nuove da salvare, controlla se ci sono risposte esistenti
      if (!hasResponsesToSave) {
        let canProceed = false;
        
        for (const [key] of Object.entries(question.placeholders)) {
          const existingResponse = getResponse(question.question_id, key);
          if (existingResponse) {
            canProceed = true;
            
            // Usa la risposta esistente per determinare la navigazione
            if (question.placeholders[key].type === "select" && !Array.isArray(existingResponse)) {
              const selectedOption = (question.placeholders[key] as any).options.find(
                (opt: any) => opt.id === existingResponse
              );
              
              if (selectedOption?.leads_to) {
                navigateToNextQuestion(question.question_id, selectedOption.leads_to);
                setIsNavigating(false);
                return;
              }
            } else if (question.placeholders[key].type === "input" && (question.placeholders[key] as any).leads_to) {
              navigateToNextQuestion(question.question_id, (question.placeholders[key] as any).leads_to);
              setIsNavigating(false);
              return;
            }
          }
        }
        
        // Se c'è almeno una risposta esistente ma nessuna navigazione specifica,
        // naviga alla prossima domanda generica
        if (canProceed) {
          navigateToNextQuestion(question.question_id, "next_block");
        }
      } else {
        for (const [key, value] of Object.entries(responses)) {
          if (value) {
            // Verifica se c'è una navigazione specificata per questa risposta
            if (question.placeholders[key].type === "select" && !Array.isArray(value)) {
              const selectedOption = (question.placeholders[key] as any).options.find(
                (opt: any) => opt.id === value
              );
              
              if (selectedOption?.leads_to) {
                navigateToNextQuestion(question.question_id, selectedOption.leads_to);
                setIsNavigating(false);
                return;
              }
            } else if (question.placeholders[key].type === "input" && (question.placeholders[key] as any).leads_to) {
              navigateToNextQuestion(question.question_id, (question.placeholders[key] as any).leads_to);
              setIsNavigating(false);
              return;
            }
          }
        }
        
        // Se nessuna opzione ha un leads_to specifico, naviga alla prossima domanda generica
        navigateToNextQuestion(question.question_id, "next_block");
      }
      
      setIsNavigating(false);
    }, 50);
  };

  // Questa è la funzione chiave che deve essere migliorata per gestire correttamente i placeholder
  const renderQuestionText = () => {
    if (!question.question_text.includes('{{')) {
      // Se non ci sono placeholder, restituisce semplicemente il testo della domanda
      return <div>{question.question_text}</div>;
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
        <div className="space-y-4">
          <div className="flex flex-wrap items-center">
            {parts.map((part, index) => {
              if (part.type === 'text') {
                return <span key={`text-${index}`}>{part.content}</span>;
              } else {
                // Render placeholder as a "Seleziona" button
                return (
                  <span key={`placeholder-${index}`}>
                    {renderPlaceholder(part.key, question.placeholders[part.key], true)}
                  </span>
                );
              }
            })}
          </div>
          
          {/* Render actual select options below for each placeholder */}
          {placeholders.map(placeholder => (
            <div key={`select-options-${placeholder.key}`} className="mt-4">
              {question.placeholders[placeholder.key] && 
                renderPlaceholder(placeholder.key, question.placeholders[placeholder.key], false)}
            </div>
          ))}
        </div>
      );
    }
    
    // Altrimenti usa il rendering normale
    const parts = [];
    let lastIndex = 0;
    
    while ((match = placeholderRegex.exec(question.question_text)) !== null) {
      const matchStart = match.index;
      const matchEnd = match.index + match[0].length;
      const placeholderKey = match[1];
      
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
          content: match[0]
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
    return (
      <div className="flex flex-wrap items-center">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={`text-${index}`}>{part.content}</span>;
          } else {
            // Renderizza l'input o il select per questo placeholder
            return <span key={`placeholder-${index}`}>{renderPlaceholder(part.key, question.placeholders[part.key])}</span>;
          }
        })}
      </div>
    );
  };

  // Renderizza la domanda principale in stile Pretto
  return (
    <form onSubmit={handleSubmit} className="max-w-xl animate-fade-in">
      {/* Domanda principale in stile Pretto */}
      <div className="text-xl md:text-2xl font-normal text-gray-900 mb-6 leading-relaxed">
        {renderQuestionText()}
      </div>
      
      {/* Pulsante continua - stile Pretto */}
      {Object.keys(question.placeholders).some(key => 
        question.placeholders[key].type !== "select" || // Solo per input o select multipli
        (question.placeholders[key].type === "select" && (question.placeholders[key] as any).multiple)
      ) && (
        <div className="mt-8">
          <Button
            type="submit"
            className="bg-black hover:bg-gray-900 text-white transition-all rounded-lg px-5 py-2 text-sm"
            disabled={(Object.keys(responses).length === 0 && 
                     !Object.keys(question.placeholders).some(key => getResponse(question.question_id, key))) || isNavigating}
          >
            Continua <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </form>
  );
}
