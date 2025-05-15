
import React, { useState, useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Question, ValidationTypes } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { Separator } from "@/components/ui/separator";
import { getQuestionTextWithClickableResponses } from "@/utils/formUtils";
import { validateInput } from "@/utils/validationUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormQuestionProps {
  question: Question;
}

export function FormQuestion({ question }: FormQuestionProps) {
  const { 
    getResponse, 
    setResponse, 
    navigateToNextQuestion, 
    getPreviousQuestionText,
    getPreviousQuestion, 
    getInlineQuestionChain,
    state, 
    addActiveBlock, 
    goToQuestion 
  } = useFormExtended();
  
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  // Stato per tenere traccia di quali placeholder hanno opzioni visibili
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  // Nuovo stato per tenere traccia degli errori di validazione
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  const params = useParams();

  // Effetto per caricare le risposte esistenti e impostare visibilità iniziale delle opzioni
  useEffect(() => {
    const existingResponses: { [key: string]: string | string[] } = {};
    const initialVisibleOptions: { [key: string]: boolean } = {};
    const initialValidationErrors: { [key: string]: boolean } = {};
    
    Object.keys(question.placeholders).forEach(key => {
      const existingResponse = getResponse(question.question_id, key);
      if (existingResponse) {
        existingResponses[key] = existingResponse;
        initialVisibleOptions[key] = false;
        
        // Verifica che le risposte esistenti siano ancora valide
        if (question.placeholders[key].type === "input") {
          const placeholder = question.placeholders[key];
          const validationType = (placeholder as any).input_validation as ValidationTypes;
          if (!validateInput(existingResponse as string, validationType)) {
            initialValidationErrors[key] = true;
          }
        }
      } else {
        initialVisibleOptions[key] = true;
      }
    });
    
    setResponses(existingResponses);
    setVisibleOptions(initialVisibleOptions);
    setValidationErrors(initialValidationErrors);
    setIsNavigating(false);
  }, [question.question_id, getResponse, question.placeholders]);

  // Funzione per gestire il cambio di risposta con validazione
  const handleResponseChange = (key: string, value: string | string[]) => {
    // Aggiorniamo sempre lo stato locale indipendentemente dalla validazione
    setResponses({
      ...responses,
      [key]: value
    });

    // Se è un input, verifichiamo la validazione
    if (question.placeholders[key].type === "input" && typeof value === "string") {
      const placeholder = question.placeholders[key];
      const validationType = (placeholder as any).input_validation as ValidationTypes;
      
      // Verifichiamo la validità dell'input
      const isValid = validateInput(value, validationType);
      
      // Aggiorniamo lo stato di errore
      setValidationErrors(prev => ({
        ...prev,
        [key]: !isValid
      }));
      
      // Salviamo nel contesto del form SOLO se l'input è valido
      if (isValid) {
        setResponse(question.question_id, key, value);
        
        // Nascondi le opzioni se valido
        setVisibleOptions(prev => ({
          ...prev,
          [key]: false
        }));
      }
    } else {
      // Per i select o altri tipi, salviamo sempre nel contesto
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
    }
  };

  // Funzione per gestire il click sul placeholder
  const handlePlaceholderClick = (key: string) => {
    setVisibleOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Funzione modificata per navigare alla domanda specifica quando si fa click su una risposta
  const handleQuestionClick = (questionId: string) => {
    // Naviga direttamente alla domanda con l'ID specificato
    if (questionId) {
      goToQuestion(state.activeQuestion.block_id, questionId);
    }
  };

  // Funzione modificata per la gestione della navigazione basata sulla priorità
  const handleNextQuestion = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Verifica se è stata specificata una priorità per i placeholder
    if (question.leads_to_placeholder_priority && 
        question.placeholders[question.leads_to_placeholder_priority]) {
      
      // Ottieni il placeholder con priorità
      const priorityPlaceholder = question.placeholders[question.leads_to_placeholder_priority];
      const priorityResponse = responses[question.leads_to_placeholder_priority] || 
                              getResponse(question.question_id, question.leads_to_placeholder_priority);
      
      // Se il placeholder prioritario è di tipo select
      if (priorityResponse && priorityPlaceholder.type === "select" && !Array.isArray(priorityResponse)) {
        const selectedOption = (priorityPlaceholder as any).options.find(
          (opt: any) => opt.id === priorityResponse
        );
        
        if (selectedOption?.leads_to) {
          setTimeout(() => {
            navigateToNextQuestion(question.question_id, selectedOption.leads_to);
            setIsNavigating(false);
          }, 50);
          return;
        }
      } 
      // Se il placeholder prioritario è di tipo input
      else if (priorityResponse && priorityPlaceholder.type === "input" && (priorityPlaceholder as any).leads_to) {
        setTimeout(() => {
          navigateToNextQuestion(question.question_id, (priorityPlaceholder as any).leads_to);
          setIsNavigating(false);
        }, 50);
        return;
      }
    }
    
    // Se non c'è un placeholder prioritario o non ha un leads_to valido,
    // usa la logica esistente per verificare i placeholder in ordine
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
    
    // Se nessun placeholder ha un leads_to valido, vai al blocco successivo
    setTimeout(() => {
      navigateToNextQuestion(question.question_id, "next_block");
      setIsNavigating(false);
    }, 50);
  };

  // Funzione per ottenere il testo completo della domanda, includendo la sequenza di domande inline
  const getQuestionText = () => {
    // Se non è una domanda inline, restituisci semplicemente il testo della domanda
    if (question.inline !== true) {
      return question.question_text;
    }
    
    // Altrimenti, recupera la catena di domande inline
    const questionChain = getInlineQuestionChain(
      state.activeQuestion.block_id, 
      state.activeQuestion.question_id
    );
    
    // Se non ci sono domande nella catena, restituisci solo il testo della domanda attuale
    if (questionChain.length === 0) {
      return question.question_text;
    }
    
    // Altrimenti, restituisci la catena di domande + la domanda attuale
    return question.question_text;
  };

  // Funzione per renderizzare la nota informativa sopra la domanda (NUOVO)
  const renderQuestionNotes = () => {
    if (!question.question_notes) {
      return null;
    }

    return (
      <div className="mb-5 p-4 bg-[#F8F4EF] border-l-4 border-[#245C4F] rounded-md">
        <p className="text-[14px] text-gray-700">{question.question_notes}</p>
      </div>
    );
  };

  // Funzione per renderizzare il testo della domanda con placeholders
  const renderQuestionText = () => {
    // Se questa è una domanda inline, mostriamo la catena di domande precedenti
    if (question.inline === true) {
      const inlineChain = getInlineQuestionChain(
        state.activeQuestion.block_id, 
        state.activeQuestion.question_id
      );
      
      if (inlineChain.length > 0) {
        // Renderizza la catena di domande inline
        return (
          <div className="inline">
            {/* Prima domanda (non inline) o inizio della catena */}
            {renderQuestionWithResponses(inlineChain[0])}
            
            {/* Domande inline intermedie */}
            {inlineChain.slice(1).map((q, index) => (
              <span key={`inline-${q.question_id}`}>
                {renderQuestionWithResponses(q)}
              </span>
            ))}
            
            {/* Domanda corrente */}
            <span className="ml-1">
              {!question.question_text.includes('{{') ? (
                <span>{question.question_text}</span>
              ) : renderQuestionPlaceholders(question.question_text)}
            </span>
          </div>
        );
      }
    }
    
    // Se non è una domanda inline o non ci sono domande precedenti,
    // renderizziamo il testo normalmente
    const fullText = getQuestionText();
    if (!fullText.includes('{{')) {
      return <span>{fullText}</span>;
    }
    
    return renderQuestionPlaceholders(fullText);
  };
  
  // Funzione per renderizzare una singola domanda con le sue risposte cliccabili
  const renderQuestionWithResponses = (q: Question) => {
    // Otteniamo le parti del testo con risposte cliccabili
    const { parts } = getQuestionTextWithClickableResponses(q, state.responses);
    
    return (
      <span className="inline">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={`part-${q.question_id}-${index}`}>{part.content}</span>;
          } else {
            // Aggiorniamo lo stile delle risposte cliccabili secondo le specifiche fornite
            return (
              <span 
                key={`part-${q.question_id}-${index}`}
                className="bg-[#F8F4EF] text-[#245C4F] font-semibold px-[10px] py-[4px] rounded-[6px] text-[16px] cursor-pointer mx-1"
                onClick={() => handleQuestionClick(q.question_id)}
              >
                {part.content}
              </span>
            );
          }
        })}
      </span>
    );
  };
  
  // Funzione per ottenere un messaggio di errore basato sul tipo di validazione
  const getValidationErrorMessage = (validationType: ValidationTypes): string => {
    switch (validationType) {
      case 'euro':
        return 'Inserire un numero intero positivo';
      case 'month':
        return 'Inserire un mese valido in italiano (es. gennaio)';
      case 'year':
        return 'Inserire un anno tra 1900 e 2150';
      case 'age':
        return 'Inserire un\'età tra 16 e 100 anni';
      case 'city':
        return 'Inserire un nome di città valido';
      case 'cap':
        return 'Inserire un CAP valido (5 cifre)';
      case 'free_text':
        return ''; // No error message for free text
      default:
        return 'Valore non valido';
    }
  };
  
  // Funzione per renderizzare i placeholder nella domanda
  const renderQuestionPlaceholders = (text: string) => {
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
          // Renderizza campo input inline con validazione
          const placeholder = question.placeholders[placeholderKey] as any;
          const existingResponse = getResponse(question.question_id, placeholderKey);
          const value = (responses[placeholderKey] as string) || (existingResponse as string) || "";
          const hasError = validationErrors[placeholderKey];
          const validationType = placeholder.input_validation;
          
          parts.push(
            <TooltipProvider key={`tooltip-${placeholderKey}`}>
              <Tooltip open={hasError ? undefined : false}>
                <TooltipTrigger asChild>
                  <span 
                    key={`placeholder-${placeholderKey}`}
                    className="inline-block align-middle mx-1"
                  >
                    <Input
                      type={placeholder.input_type || "text"}
                      value={value}
                      onChange={(e) => handleResponseChange(placeholderKey, e.target.value)}
                      placeholder={placeholder.placeholder_label || ""}
                      className={cn(
                        "inline-block align-middle text-center",
                        "border-[1.5px] rounded-[8px]",
                        "text-[16px] text-[#222222] font-['Inter']",
                        "h-[48px] px-[12px] py-[10px]",
                        "outline-none focus:ring-0",
                        "placeholder:text-[#E7E1D9] placeholder:font-normal",
                        {
                          "border-[#245C4F] focus:border-[#245C4F]": !hasError,
                          "border-red-500 focus:border-red-500": hasError,
                          "w-[70px]": placeholder.input_type === "number",
                          "w-[120px]": placeholder.input_type === "text" && placeholder.placeholder_label?.toLowerCase().includes("cap"),
                          "w-[200px]": placeholder.input_type === "text" && !placeholder.placeholder_label?.toLowerCase().includes("cap"),
                        }
                      )}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-red-50 text-red-600 border border-red-200">
                  {getValidationErrorMessage(validationType)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
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
            {placeholder.options.map((option: any) => (
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

  // Funzione migliorata per determinare se tutte le input hanno contenuto valido
  const allInputsHaveValidContent = () => {
    const inputPlaceholders = Object.keys(question.placeholders).filter(
      key => question.placeholders[key].type === "input"
    );
    
    // Se non ci sono input, consideriamo valido (per gestire select e altri tipi)
    if (inputPlaceholders.length === 0) {
      return true;
    }
    
    // Verifica se tutti gli input hanno un valore e sono validi
    return inputPlaceholders.every(key => {
      const value = responses[key] || getResponse(question.question_id, key);
      
      // Verifica se il valore esiste
      if (value === undefined || value === "") {
        return false;
      }
      
      // Verifica se c'è un errore di validazione
      if (validationErrors[key]) {
        return false;
      }
      
      // Verifica validazione per i valori esistenti nel contesto
      const placeholder = question.placeholders[key];
      if (placeholder.type === "input") {
        const validationType = (placeholder as any).input_validation;
        if (!validateInput(value as string, validationType)) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  // Determina se ci sono risposte valide - MODIFICATO per richiedere TUTTE le risposte
  const hasValidResponses = Object.keys(question.placeholders).every(key => 
    responses[key] !== undefined || getResponse(question.question_id, key) !== undefined
  ) && allInputsHaveValidContent();

  return (
    <div className="max-w-xl animate-fade-in">
      {/* Banner note della domanda - NUOVO COMPONENTE */}
      {renderQuestionNotes()}
      
      {/* Testo della domanda semplificato */}
      <div className="text-[16px] font-normal text-gray-900 mb-5 leading-relaxed">
        {renderQuestionText()}
      </div>
      
      {/* Linea separatrice beige */}
      <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />
      
      {/* Contenitore per i select options visibili */}
      <div className="space-y-5">
        {Object.keys(question.placeholders).map(key => renderVisibleSelectOptions(key, question.placeholders[key]))}
      </div>
      
      {/* Pulsante Avanti - mostrato solo se ci sono risposte valide e tutti gli input hanno contenuto valido */}
      {hasValidResponses && (
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
