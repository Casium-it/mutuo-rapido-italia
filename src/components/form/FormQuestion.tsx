import React, { useState, useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Question, ValidationTypes } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
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
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  const [editingFields, setEditingFields] = useState<{ [key: string]: boolean }>({});
  const [showNonLoSoButton, setShowNonLoSoButton] = useState(false);
  const [cursorPositions, setCursorPositions] = useState<{ [key: string]: number | null }>({});
  const params = useParams();

  const hasMissingOrInvalidInputs = () => {
    const inputPlaceholders = Object.keys(question.placeholders).filter(
      key => question.placeholders[key].type === "input"
    );
    
    if (inputPlaceholders.length === 0) {
      return false;
    }
    
    return inputPlaceholders.some(key => {
      const value = responses[key] || getResponse(question.question_id, key);
      if (value === undefined || value === "") {
        return true;
      }
      if (validationErrors[key]) {
        return true;
      }
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

  // Nuova funzione per gestire la navigazione indietro
  const handleBackNavigation = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    // Converti il Set answeredQuestions in un array e ordinalo cronologicamente
    const answeredQuestionsArray = Array.from(state.answeredQuestions);
    
    // Trova l'indice della domanda corrente
    const currentQuestionIndex = answeredQuestionsArray.indexOf(state.activeQuestion.question_id);
    
    // Se la domanda corrente non è nel registro o è la prima domanda, non c'è "indietro"
    if (currentQuestionIndex <= 0) {
      setIsNavigating(false);
      return;
    }
    
    // Ottieni l'ID della domanda precedente
    const previousQuestionId = answeredQuestionsArray[currentQuestionIndex - 1];
    
    // Trova il blocco che contiene questa domanda
    let previousBlockId = "";
    let foundQuestion = false;
    
    // Cerca tra tutti i blocchi per trovare a quale blocco appartiene la domanda
    for (const block of blocks) {
      const questionExists = block.questions.some(q => q.question_id === previousQuestionId);
      if (questionExists) {
        previousBlockId = block.block_id;
        foundQuestion = true;
        break;
      }
    }
    
    // Se abbiamo trovato sia la domanda che il blocco, naviga a quella domanda
    if (foundQuestion && previousBlockId) {
      setTimeout(() => {
        goToQuestion(previousBlockId, previousQuestionId, true);
        setIsNavigating(false);
      }, 50);
    } else {
      setIsNavigating(false);
    }
  };

  const handleNonLoSoClick = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    const inputPlaceholders = Object.keys(question.placeholders).filter(
      key => question.placeholders[key].type === "input"
    );
    
    inputPlaceholders.forEach(key => {
      const value = responses[key] || getResponse(question.question_id, key);
      const isValid = !validationErrors[key];
      
      if (!value || value === "" || !isValid) {
        setResponse(question.question_id, key, "non lo so");
        setResponses(prev => ({
          ...prev,
          [key]: "non lo so"
        }));
        setValidationErrors(prev => ({
          ...prev,
          [key]: false
        }));
      }
    });
    
    // Navigazione alla domanda successiva basata su priorità e placeholder
    handleNextQuestion();
  };

  const handleResponseChange = (key: string, value: string | string[]) => {
    const placeholder = question.placeholders[key];
    
    if (placeholder.type === "input" && typeof value === 'string') {
      const validationType = (placeholder as any).input_validation as ValidationTypes;
      
      if (validationType === "euro" && value !== "non lo so") {
        const selectionStart = cursorPositions[key];
        const { formattedValue, newCursorPosition } = formatEuroInput(value, selectionStart);
        
        setCursorPositions({
          ...cursorPositions,
          [key]: newCursorPosition
        });
        
        setResponses({
          ...responses,
          [key]: formattedValue
        });
        
        setEditingFields(prev => ({
          ...prev,
          [key]: true
        }));
        
        if (value === "") {
          setResponse(question.question_id, key, "");
        }
        
        return;
      }
    }
    
    setResponses({
      ...responses,
      [key]: value
    });

    setEditingFields(prev => ({
      ...prev,
      [key]: true
    }));

    if (question.placeholders[key].type === "input" && typeof value === "string") {
      if (value === "") {
        setResponse(question.question_id, key, value);
      }
    } else {
      setResponse(question.question_id, key, value);
      
      setVisibleOptions(prev => ({
        ...prev,
        [key]: false
      }));
      
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

  const handleQuestionClick = (questionId: string) => {
    if (questionId) {
      goToQuestion(state.activeQuestion.block_id, questionId);
    }
  };

  const handleNextQuestion = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    if (question.leads_to_placeholder_priority && 
        question.placeholders[question.leads_to_placeholder_priority]) {
      
      const priorityPlaceholder = question.placeholders[question.leads_to_placeholder_priority];
      const priorityResponse = responses[question.leads_to_placeholder_priority] || 
                              getResponse(question.question_id, question.leads_to_placeholder_priority);
      
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
      else if (priorityResponse && priorityPlaceholder.type === "input" && (priorityPlaceholder as any).leads_to) {
        setTimeout(() => {
          navigateToNextQuestion(question.question_id, (priorityPlaceholder as any).leads_to);
          setIsNavigating(false);
        }, 50);
        return;
      }
    }
    
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
    
    setTimeout(() => {
      navigateToNextQuestion(question.question_id, "next_block");
      setIsNavigating(false);
    }, 50);
  };

  const renderQuestionText = () => {
    if (question.inline !== true) {
      return question.question_text;
    }
    
    const questionChain = getInlineQuestionChain(
      state.activeQuestion.block_id, 
      state.activeQuestion.question_id
    );
    
    if (questionChain.length === 0) {
      return question.question_text;
    }
    
    return question.question_text;
  };

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
      
      {/* Renderizza i MultiBlockManager placeholder */}
      {Object.entries(question.placeholders)
        .filter(([_, placeholder]) => placeholder.type === "MultiBlockManager")
        .map(([key, placeholder]) => (
          <div key={`multi-${key}`} className="mt-5">
            <MultiBlockManager
              questionId={question.question_id}
              placeholderKey={key}
              placeholder={placeholder as any}
            />
          </div>
        ))}
      
      {/* Pulsante "Non lo so" - mostrato solo quando ci sono input mancanti o non validi, dopo 5 secondi */}
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
      
      {/* Pulsante Avanti - mostrato solo se ci sono risposte valide e tutti gli input hanno contenuto valido */}
      {Object.keys(question.placeholders).every(key => 
        (responses[key] !== undefined && responses[key] !== "") || 
        (getResponse(question.question_id, key) !== undefined && getResponse(question.question_id, key) !== "")
      ) && (
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
      
      {/* Nuovo Pulsante Indietro - sempre visibile */}
      <div className="mt-4">
        <button
          type="button"
          className={cn(
            "text-[#BEB8AE] hover:text-[#AFA89F] text-[15px] font-medium underline",
            "inline-flex items-center transition-colors"
          )}
          onClick={handleBackNavigation}
          disabled={isNavigating}
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          indietro
        </button>
      </div>
    </div>
  );
}
