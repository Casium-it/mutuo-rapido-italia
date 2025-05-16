
import React, { useState, useEffect } from "react";
import { Question, ValidationTypes } from "@/types/form";
import { QuestionProvider } from "@/contexts/QuestionContext";
import { useFormExtended } from "@/hooks/useFormExtended";
import { validateInput } from "@/utils/validationUtils";
import { getQuestionTextWithClickableResponses } from "@/utils/formUtils";

interface FormQuestionProviderProps {
  question: Question;
  children: React.ReactNode;
}

export function FormQuestionProvider({ question, children }: FormQuestionProviderProps) {
  const { 
    getResponse, 
    setResponse, 
    navigateToNextQuestion,
    getPreviousQuestion, 
    getInlineQuestionChain,
    state, 
    addActiveBlock, 
    goToQuestion 
  } = useFormExtended();
  
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});

  // Effetto per caricare le risposte esistenti e impostare visibilità iniziale delle opzioni
  useEffect(() => {
    const existingResponses: { [key: string]: any } = {};
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
  const handleValueChange = (key: string, value: any) => {
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

  // Funzione per navigare alla domanda specifica quando si fa click su una risposta
  const handleQuestionClick = (questionId: string) => {
    // Naviga direttamente alla domanda con l'ID specificato
    if (questionId) {
      goToQuestion(state.activeQuestion.block_id, questionId);
    }
  };

  // Funzione per la gestione della navigazione basata sulla priorità
  const handleNextStep = () => {
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

  const handlePreviousStep = () => {
    // Per form question, tornare alla domanda precedente significa navigare indietro
    const previousQuestion = getPreviousQuestion();
    if (previousQuestion) {
      goToQuestion(previousQuestion.block_id, previousQuestion.question_id);
    }
  };

  // Funzione per ottenere il testo completo della domanda, includendo la sequenza di domande inline
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
              {question.question_text}
            </span>
          </div>
        );
      }
    }
    
    // Se non è una domanda inline o non ci sono domande precedenti,
    // renderizziamo il testo normalmente
    return <span>{question.question_text}</span>;
  };

  // Funzione per renderizzare una singola domanda con le sue risposte cliccabili
  const renderQuestionWithResponses = (q: Question) => {
    // Correzione qui: questa funzione mancava degli argomenti richiesti
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

  // Funzione migliorata per determinare se tutte le input hanno contenuto valido
  const isCurrentStepValid = () => {
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

  // Ottiene un messaggio di errore basato sul tipo di validazione
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

  // Context value
  const contextValue = {
    responses,
    validationErrors,
    visibleOptions,
    handleValueChange,
    handlePlaceholderClick,
    handleNextStep,
    handlePreviousStep,
    isCurrentStepValid,
    isNavigating,
    getValidationErrorMessage,
  };

  return (
    <QuestionProvider value={contextValue}>
      {children}
    </QuestionProvider>
  );
}
