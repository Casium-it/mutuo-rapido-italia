import React, { useState, useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Question, ValidationTypes } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Edit } from "lucide-react";
import { useParams } from "react-router-dom";
import { cn, formatNumberWithThousandSeparator, capitalizeWords } from "@/lib/utils";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { Separator } from "@/components/ui/separator";
import { getQuestionTextWithClickableResponses } from "@/utils/formUtils";
import { validateInput } from "@/utils/validationUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MultiBlockManager } from "./MultiBlockManager";

// Funzione per formattare il valore da visualizzare in base al tipo di validazione
const formatDisplayValue = (value: string, validationType: ValidationTypes): string => {
  if (!value) return "";
  
  switch (validationType) {
    case "euro":
      // Formatta con separatore migliaia in formato italiano
      return formatNumberWithThousandSeparator(value);
    case "city":
    case "month":
      // Capitalizza la prima lettera di ogni parola per città e mesi
      return capitalizeWords(value);
    default:
      // Per tutti gli altri tipi, mantieni il valore originale
      return value;
  }
};

// Nuova funzione per formattare i numeri Euro mentre l'utente digita
// Mantiene la posizione del cursore dopo la formattazione
const formatEuroInput = (value: string, selectionStart: number | null): { 
  formattedValue: string; 
  newCursorPosition: number | null;
} => {
  // Se il valore è "non lo so", restituisci senza modifiche
  if (value === "non lo so") {
    return { formattedValue: value, newCursorPosition: selectionStart };
  }

  // Rimuovi tutti i caratteri non numerici (compresi i separatori esistenti)
  const numericValue = value.replace(/\D/g, "");
  
  // Se è vuoto, restituisci una stringa vuota
  if (numericValue === "") {
    return { formattedValue: "", newCursorPosition: 0 };
  }
  
  // Ottieni il valore non formattato prima del cursore
  const valueBeforeCursor = selectionStart !== null 
    ? value.substring(0, selectionStart).replace(/\D/g, "") 
    : "";
  
  // Formatta il numero con separatori delle migliaia
  const formattedValue = new Intl.NumberFormat('it-IT', { 
    useGrouping: true, 
    maximumFractionDigits: 0,
  }).format(parseInt(numericValue));
  
  // Calcola la nuova posizione del cursore
  let newCursorPosition = 0;
  if (selectionStart !== null) {
    // Conta i separatori prima del cursore originale nel nuovo valore formattato
    let separatorCount = 0;
    let digitsCount = 0;
    
    for (let i = 0; i < formattedValue.length; i++) {
      if (/\d/.test(formattedValue[i])) {
        digitsCount++;
        if (digitsCount > valueBeforeCursor.length) break;
      } else {
        separatorCount++;
      }
      
      // Quando raggiungiamo il numero di cifre inserite prima del cursore
      if (digitsCount === valueBeforeCursor.length) {
        newCursorPosition = i + 1;
        break;
      }
    }
    
    // Se non abbiamo trovato la posizione, usiamo la lunghezza totale
    if (newCursorPosition === 0 && valueBeforeCursor.length > 0) {
      newCursorPosition = formattedValue.length;
    }
  }
  
  return { 
    formattedValue, 
    newCursorPosition 
  };
};

// Funzione per ripulire un valore formattato prima della validazione o salvataggio
const cleanEuroValue = (value: string): string => {
  // Se è "non lo so", mantienilo così
  if (value === "non lo so") return value;
  
  // Altrimenti rimuovi tutti i caratteri non numerici (separatori, spazi, etc)
  return value.replace(/\D/g, "");
};

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
    blocks,
    addActiveBlock,
    goToQuestion 
  } = useFormExtended();
  
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  // Stato per tenere traccia di quali placeholder hanno opzioni visibili
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  // Stato per tenere traccia degli errori di validazione
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  // Stato per tenere traccia dei campi in fase di editing
  const [editingFields, setEditingFields] = useState<{ [key: string]: boolean }>({});
  // Stato per "Non lo so" button
  const [showNonLoSoButton, setShowNonLoSoButton] = useState(false);
  // Nuovo stato per tenere traccia delle posizioni del cursore
  const [cursorPositions, setCursorPositions] = useState<{ [key: string]: number | null }>({});
  const params = useParams();

  // Nuova funzione per verificare se ci sono campi di input mancanti o non validi
  const hasMissingOrInvalidInputs = () => {
    const inputPlaceholders = Object.keys(question.placeholders).filter(
      key => question.placeholders[key].type === "input"
    );
    
    if (inputPlaceholders.length === 0) {
      return false;
    }
    
    return inputPlaceholders.some(key => {
      const value = responses[key] || getResponse(question.question_id, key);
      
      // Se manca un valore, è considerato "mancante"
      if (value === undefined || value === "") {
        return true;
      }
      
      // Se c'è un errore di validazione, è "non valido"
      if (validationErrors[key]) {
        return true;
      }
      
      // Verifica anche la validazione per i valori esistenti
      if (value !== "") {
        const placeholder = question.placeholders[key];
        if (placeholder.type === "input") {
          const validationType = (placeholder as any).input_validation;
          if (!validateInput(value as string, validationType)) {
            return true;
          }
        }
      }
      
      return false;
    });
  };

  // Nuovo timer effect per mostrare il pulsante "Non lo so" dopo 1.5 secondi invece di 5
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Verifica se la domanda è skippable e se ci sono campi di input mancanti o non validi
    if (question.skippableWithNotSure && hasMissingOrInvalidInputs()) {
      // Imposta un timer per mostrare il pulsante dopo 1.5 secondi invece di 5
      timer = setTimeout(() => {
        setShowNonLoSoButton(true);
      }, 1500);
    } else {
      // Se tutti i campi sono validi o la domanda non è skippable, nascondi il pulsante
      setShowNonLoSoButton(false);
    }

    return () => {
      // Pulisci il timer quando il componente si smonta o quando l'effetto viene richiamato
      clearTimeout(timer);
    };
  }, [responses, validationErrors, question.skippableWithNotSure]);

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
    setEditingFields({});
    setIsNavigating(false);
    // Reset dello stato del pulsante "Non lo so" quando cambia la domanda
    setShowNonLoSoButton(false);
    // Reset delle posizioni del cursore
    setCursorPositions({});
  }, [question.question_id, getResponse, question.placeholders]);

  // Funzione per gestire la navigazione indietro con gestione del caso speciale
  const handleBackNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Ottieni array di domande risposte dal set
    const answeredQuestionsArray = Array.from(state.answeredQuestions);
    
    if (answeredQuestionsArray.length === 0) {
      // Se non ci sono domande precedenti, non possiamo andare indietro
      setIsNavigating(false);
      return;
    }
    
    // Trova l'indice della domanda corrente nell'array delle domande risposte
    const currentQuestionIndex = answeredQuestionsArray.indexOf(state.activeQuestion.question_id);
    
    let targetQuestionIndex;
    
    if (currentQuestionIndex <= 0) {
      // Se la domanda corrente non è nell'array o è la prima,
      // considera la domanda corrente come se fosse dopo l'ultima dell'array
      targetQuestionIndex = answeredQuestionsArray.length - 1;
    } else {
      // Altrimenti vai alla domanda precedente nell'array
      targetQuestionIndex = currentQuestionIndex - 1;
    }
    
    // Ottieni l'ID della domanda precedente
    const previousQuestionId = answeredQuestionsArray[targetQuestionIndex];
    
    // Trova il blocco che contiene questa domanda
    const blockWithPreviousQuestion = findBlockByQuestionId(blocks, previousQuestionId);
    
    if (!blockWithPreviousQuestion) {
      console.error("Blocco della domanda precedente non trovato:", previousQuestionId);
      setIsNavigating(false);
      return;
    }
    
    // Naviga alla domanda precedente
    setTimeout(() => {
      goToQuestion(blockWithPreviousQuestion.block_id, previousQuestionId);
      setIsNavigating(false);
    }, 50);
  };

  // Funzione aggiornata per gestire il click sul pulsante "Non lo so"
  const handleNonLoSoClick = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Trova tutti i placeholder di tipo input che sono vuoti o non validi
    const inputPlaceholders = Object.keys(question.placeholders).filter(
      key => question.placeholders[key].type === "input"
    );
    
    // Imposta "non lo so" per tutti i campi input mancanti o non validi
    inputPlaceholders.forEach(key => {
      const value = responses[key] || getResponse(question.question_id, key);
      const isValid = !validationErrors[key];
      
      if (!value || value === "" || !isValid) {
        setResponse(question.question_id, key, "non lo so");
        
        // Aggiorna anche lo stato locale
        setResponses(prev => ({
          ...prev,
          [key]: "non lo so"
        }));
        
        // Resetta gli errori di validazione
        setValidationErrors(prev => ({
          ...prev,
          [key]: false
        }));
      }
    });
    
    // Procedi con la navigazione come nel handleNextQuestion
    // ... keep existing code (navigazione alla domanda successiva basata su priorità e placeholder)
  };

  // Funzione aggiornata per gestire il cambio di risposta con formattazione per campi euro
  const handleResponseChange = (key: string, value: string | string[]) => {
    const placeholder = question.placeholders[key];
    
    // Gestione speciale per campi di tipo input con validazione "euro"
    if (placeholder.type === "input" && typeof value === 'string') {
      const validationType = (placeholder as any).input_validation as ValidationTypes;
      
      if (validationType === "euro" && value !== "non lo so") {
        // Ottieni la posizione corrente del cursore
        const selectionStart = cursorPositions[key];
        
        // Formatta il valore con separatori delle migliaia
        const { formattedValue, newCursorPosition } = formatEuroInput(value, selectionStart);
        
        // Aggiorna la posizione del cursore
        setCursorPositions({
          ...cursorPositions,
          [key]: newCursorPosition
        });
        
        // Salviamo il valore formattato nello stato locale per visualizzazione
        setResponses({
          ...responses,
          [key]: formattedValue
        });
        
        // Segna il campo come in fase di editing
        setEditingFields(prev => ({
          ...prev,
          [key]: true
        }));
        
        // Se l'utente cancella il valore, cancelliamo anche dal contesto
        if (value === "") {
          setResponse(question.question_id, key, "");
        }
        
        return; // Usciamo dalla funzione per evitare di eseguire il codice standard
      }
    }
    
    // Codice standard per altri tipi di campi (non euro)
    setResponses({
      ...responses,
      [key]: value
    });

    // Segna il campo come in fase di editing
    setEditingFields(prev => ({
      ...prev,
      [key]: true
    }));

    // Se è un input, verifichiamo solo se è vuoto per resettare il contesto
    if (question.placeholders[key].type === "input" && typeof value === "string") {
      // Se l'utente cancella il valore, cancelliamo anche dal contesto
      if (value === "") {
        setResponse(question.question_id, key, value);
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

  // Funzione aggiornata per gestire la perdita di focus di un campo
  const handleInputBlur = (key: string, value: string) => {
    // Rimuoviamo lo stato di editing
    setEditingFields(prev => ({
      ...prev,
      [key]: false
    }));

    // Se il campo è vuoto, mantienilo vuoto
    if (value === "") {
      return;
    }

    // Se è un input, verifichiamo la validazione
    if (question.placeholders[key].type === "input") {
      const placeholder = question.placeholders[key];
      const validationType = (placeholder as any).input_validation as ValidationTypes;
      
      // Per i campi euro, puliamo il valore prima della validazione
      let valueToValidate = value;
      let valueToStore = value;
      
      if (validationType === "euro" && value !== "non lo so") {
        valueToValidate = cleanEuroValue(value);
      }
      
      // Verifichiamo la validità dell'input
      const isValid = validateInput(valueToValidate, validationType);
      
      // Aggiorniamo lo stato di errore
      setValidationErrors(prev => ({
        ...prev,
        [key]: !isValid
      }));
      
      // Salviamo nel contesto del form SOLO se l'input è valido
      if (isValid) {
        // Per i campi euro, salviamo il valore pulito nel contesto
        if (validationType === "euro" && value !== "non lo so") {
          // Nel contesto salviamo il valore numerico senza separatori
          setResponse(question.question_id, key, valueToValidate);
        } else {
          setResponse(question.question_id, key, value);
        }
        
        // Nascondi le opzioni se valido
        setVisibleOptions(prev => ({
          ...prev,
          [key]: false
        }));
      }
    }
  };

  // Funzione per gestire l'evento onFocus dell'input
  const handleInputFocus = (key: string) => {
    setEditingFields(prev => ({
      ...prev,
      [key]: true
    }));
  };

  // Funzione per tenere traccia della posizione del cursore
  const handleInputSelectionChange = (key: string, selectionStart: number | null) => {
    setCursorPositions(prev => ({
      ...prev,
      [key]: selectionStart
    }));
  };

  // Funzione per gestire il click sul placeholder
  const handlePlaceholderClick = (key: string) => {
    setVisibleOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Funzione per attivare la modalità di modifica di un input
  const handleInputClick = (key: string) => {
    setEditingFields(prev => ({
      ...prev,
      [key]: true
    }));
  };

  // Funzione modificata per navigare alla domanda specifica quando si fa click su una risposta
  const handleQuestionClick = (questionId: string) => {
    // Naviga direttamente alla domanda con l'ID specificato
    if (questionId && !isNavigating) {
      setIsNavigating(true);
      setTimeout(() => {
        goToQuestion(state.activeQuestion.block_id, questionId);
        setIsNavigating(false);
      }, 50);
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
          // Check for stop_flow case
          if (selectedOption.leads_to === "stop_flow") {
            // Set session storage to indicate stop flow state and trigger the error message
            sessionStorage.setItem("stopFlowActivated", "true");
            setTimeout(() => {
              // Reload the current question to trigger the useEffect in QuestionView
              window.location.reload();
              setIsNavigating(false);
            }, 50);
            return;
          }
          
          setTimeout(() => {
            navigateToNextQuestion(question.question_id, selectedOption.leads_to);
            setIsNavigating(false);
          }, 50);
          return;
        }
      } 
      // Se il placeholder prioritario è di tipo input
      else if (priorityResponse && priorityPlaceholder.type === "input" && (priorityPlaceholder as any).leads_to) {
        // Check for stop_flow case for input
        if ((priorityPlaceholder as any).leads_to === "stop_flow") {
          // Set session storage to indicate stop flow state
          sessionStorage.setItem("stopFlowActivated", "true");
          setTimeout(() => {
            // Reload the current question to trigger the useEffect in QuestionView
            window.location.reload();
            setIsNavigating(false);
          }, 50);
          return;
        }
        
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
          // Check for stop_flow case
          if (selectedOption.leads_to === "stop_flow") {
            // Set session storage to indicate stop flow state
            sessionStorage.setItem("stopFlowActivated", "true");
            setTimeout(() => {
              // Reload the current question to trigger the useEffect in QuestionView
              window.location.reload();
              setIsNavigating(false);
            }, 50);
            return;
          }
          
          setTimeout(() => {
            navigateToNextQuestion(question.question_id, selectedOption.leads_to);
            setIsNavigating(false);
          }, 50);
          return;
        }
      } else if (response && question.placeholders[key].type === "input" && (question.placeholders[key] as any).leads_to) {
        // Check for stop_flow case for input
        if ((question.placeholders[key] as any).leads_to === "stop_flow") {
          // Set session storage to indicate stop flow state
          sessionStorage.setItem("stopFlowActivated", "true");
          setTimeout(() => {
            // Reload the current question to trigger the useEffect in QuestionView
            window.location.reload();
            setIsNavigating(false);
          }, 50);
          return;
        }
        
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
            {/* Renderizza ogni domanda nella catena */}
            {inlineChain.map((q, index) => (
              <span key={`inline-${q.question_id}`} className={index > 0 ? "ml-1" : ""}>
                {renderQuestionWithResponses(q)}
                {index < inlineChain.length - 1 ? " " : ""}
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
  
  // Function for rendering question placeholders
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
          const isEditing = editingFields[placeholderKey];
          const validationType = placeholder.input_validation;
          
          // Modifica qui: verifichiamo esplicitamente se il valore è "non lo so" per gestirlo correttamente
          const isNonLoSo = value === "non lo so";
          
          // Per i valori normali usiamo la validazione standard, ma per "non lo so" consideriamo sempre valido
          const isValid = isNonLoSo || validateInput(
            validationType === "euro" ? cleanEuroValue(value) : value, 
            validationType
          );
          
          // Determine width dynamically based on placeholder label and type
          const getInputWidth = () => {
            const label = placeholder.placeholder_label || "";
            if (validationType === "euro") {
              return "w-[100px]"; // Keep euro width at 100px
            } else if (validationType === "month") {
              return "w-[120px]"; // Set month width to 100px (half the previous size)
            } else if (placeholder.input_type === "number") {
              return "w-[70px]";
            } else if (placeholder.input_type === "text" && placeholder.placeholder_label?.toLowerCase().includes("cap")) {
              return "w-[120px]";
            } else {
              return "w-[200px]";
            }
          };
          
          // Mostra un elemento span stilizzato SOLO se il valore è valido, NON in editing mode, 
          // e l'utente ha terminato di digitare (non è attualmente in focus)
          if (isValid && value && !isEditing && !hasError) {
            // Formatta il valore in base al tipo di validazione prima di mostrarlo
            // Per "non lo so" manteniamo il valore originale senza formattazione
            const formattedValue = isNonLoSo ? "non lo so" : formatDisplayValue(value, validationType);
            
            // Renderizza uno span styled che assomiglia a una risposta completata CON ICONA DI MODIFICA
            parts.push(
              <span 
                key={`placeholder-${placeholderKey}`}
                className="inline-flex items-center bg-[#F8F4EF] text-[#245C4F] font-semibold px-[10px] py-[4px] rounded-[6px] text-[16px] cursor-pointer mx-1 hover:bg-[#F0EAE0] transition-colors group"
                onClick={() => handleInputClick(placeholderKey)}
                aria-label={`${formattedValue} - clicca per modificare`}
              >
                <span>{formattedValue}</span>
                <Edit 
                  className="ml-1 h-3 w-3 text-[#245C4F] opacity-60 group-hover:opacity-100 transition-opacity" 
                  aria-hidden="true"
                />
              </span>
            );
          } else {
            // Altrimenti renderizza l'input normale (per editing, invalido o vuoto)
            parts.push(
              <TooltipProvider key={`tooltip-${placeholderKey}`}>
                <Tooltip open={hasError && !isEditing ? undefined : false}>
                  <TooltipTrigger asChild>
                    <span 
                      key={`placeholder-${placeholderKey}`}
                      className="inline-block align-middle mx-1"
                    >
                      <Input
                        inputMode={validationType === "age" || validationType === "euro" ? "numeric" : "text"}
                        value={value}
                        onChange={(e) => handleResponseChange(placeholderKey, e.target.value)}
                        onFocus={() => handleInputFocus(placeholderKey)}
                        onBlur={() => handleInputBlur(placeholderKey, value)}
                        onSelect={(e) => handleInputSelectionChange(
                          placeholderKey, 
                          (e.target as HTMLInputElement).selectionStart
                        )}
                        placeholder={placeholder.placeholder_label || ""}
                        className={cn(
                          "inline-block align-middle text-center",
                          "border-[1.5px] rounded-[8px]",
                          "text-[16px] text-[#222222] font-['Inter']",
                          "h-[32px] px-[12px] py-[6px]", // Changed from h-[38px] to h-[32px] and py-[8px] to py-[6px]
                          "outline-none focus:ring-0",
                          "placeholder:text-[#E7E1D9] placeholder:font-normal",
                          "appearance-none",
                          getInputWidth(),
                          {
                            // Stati diversi del bordo
                            "border-[#E7E1D9]": value === "" && !hasError,  // Vuoto (stato iniziale)
                            "border-[#245C4F] focus:border-[#245C4F]": isEditing && !hasError, // Durante editing senza errori
                            "border-red-500": hasError,                     // Errore di validazione
                          }
                        )}
                        style={{ 
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-red-50 text-red-600 border border-red-200">
                    {getValidationErrorMessage(validationType)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }
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
    
    // Verifica se tutti gli input hanno un valore NON vuoto e sono validi
    return inputPlaceholders.every(key => {
      const value = responses[key] || getResponse(question.question_id, key);
      
      // Verifica se il valore esiste e non è vuoto
      if (value === undefined || value === "") {
        return false;
      }
      
      // Se c'è un errore di validazione, non è valido
      if (validationErrors[key]) {
        return false;
      }
      
      // Verifica validazione per i valori esistenti nel contesto
      if (value !== "") {
        const placeholder = question.placeholders[key];
        if (placeholder.type === "input") {
          const validationType = (placeholder as any).input_validation;
          if (!validateInput(value as string, validationType)) {
            return false;
          }
        }
      }
      
      return true;
    });
  };
  
  // Determina se ci sono risposte valide - MODIFICATO per richiedere TUTTE le risposte
  const hasValidResponses = Object.keys(question.placeholders).every(key => 
    (responses[key] !== undefined && responses[key] !== "") || 
    (getResponse(question.question_id, key) !== undefined && getResponse(question.question_id, key) !== "")
  ) && allInputsHaveValidContent();

  // Renderizza i MultiBlockManager placeholder
  const renderMultiBlockManagers = () => {
    const multiBlockManagers = Object.entries(question.placeholders)
      .filter(([_, placeholder]) => placeholder.type === "MultiBlockManager")
      .map(([key, placeholder]) => (
        <div key={`multi-${key}`} className="mt-5">
          <MultiBlockManager
            questionId={question.question_id}
            placeholderKey={key}
            placeholder={placeholder as any}
          />
        </div>
      ));

    if (multiBlockManagers.length > 0) {
      return (
        <div className="space-y-4">
          {multiBlockManagers}
        </div>
      );
    }
    
    return null;
  };
  
  // Check if there are any visible select options
  const hasVisibleSelectOptions = Object.keys(question.placeholders).some(key => 
    question.placeholders[key].type === "select" && visibleOptions[key]
  );

  // Check if back button should be shown
  const showBackButton = !(state.activeQuestion.block_id === "introduzione" && 
    state.activeQuestion.question_id === blocks.find(b => b.block_id === "introduzione")?.questions[0].question_id);
  
  return (
    <div className="max-w-xl animate-fade-in">
      {/* Note banner per le question notes - Design migliorato */}
      {question.question_notes && (
        <div className="mb-4 bg-[#F8F4EF] rounded-md border-b-4 border-[#BEB8AE] px-4 py-3 text-[14px] font-normal text-gray-700">
          <span className="font-bold">Nota: </span>
          {question.question_notes}
        </div>
      )}
      
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
      
      {/* Nuovo contenitore per i MultiBlockManager placeholder */}
      {renderMultiBlockManagers()}
      
      {/* Pulsante "Non lo so" - mostrato solo quando ci sono input mancanti o non validi, dopo 1.5 secondi */}
      {showNonLoSoButton && question.skippableWithNotSure && hasMissingOrInvalidInputs() && (
        <div className="mt-5 animate-fade-in">
          <button
            type="button"
            className={cn(
              "text-left px-[18px] py-[12px] border-[1.5px] rounded-[10px] transition-all font-['Inter'] text-[16px] font-normal",
              "shadow-[0_3px_0_0_#AFA89F] mb-[10px] cursor-pointer w-fit",
              "hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]",
              "border-[#BEB8AE] bg-[#F8F4EF] text-[#222222]"
            )}
            onClick={handleNonLoSoClick}
          >
            <div className="font-medium">Non lo so</div>
          </button>
        </div>
      )}
      
      {/* Container per i pulsanti Indietro e Avanti */}
      {(showBackButton || (hasValidResponses && !Object.values(question.placeholders).some(p => p.type === "MultiBlockManager"))) && (
        <div className="mt-8 flex items-center gap-4">
          {/* Pulsante Indietro */}
          {showBackButton && (
            <Button
              type="button"
              className={cn(
                "bg-[#245C4F]/20 hover:bg-[#245C4F]/30 text-[#245C4F] px-[32px] py-[16px] rounded-[12px] text-[17px] font-medium",
                "transition-all shadow-[0_6px_12px_rgba(36,92,79,0.1)] hover:shadow-[0_8px_16px_rgba(36,92,79,0.15)]",
                "inline-flex items-center gap-[12px]"
              )}
              onClick={handleBackNavigation}
              disabled={isNavigating}
            >
              <ArrowLeft className="h-4 w-4" /> Indietro
            </Button>
          )}
          
          {/* Pulsante Avanti - mostrato solo se ci sono risposte valide e tutti gli input hanno contenuto valido */}
          {hasValidResponses && !Object.values(question.placeholders).some(p => p.type === "MultiBlockManager") && (
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
          )}
        </div>
      )}
    </div>
  );
}

// Funzione per trovare un blocco di domande per una domanda specifica
const findBlockByQuestionId = (blocks: any[], questionId: string): any => {
  return blocks.find(block => block.questions.some(q => q.question_id === questionId));
}
