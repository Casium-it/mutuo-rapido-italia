
import React, { useState, useEffect } from "react";
import { QuestionProvider } from "@/contexts/QuestionContext";
import { SubflowQuestion, RepeatingGroupEntry, ValidationTypes } from "@/types/form";
import { validateInput } from "@/utils/validationUtils";

interface RepeatingGroupQuestionProviderProps {
  question: SubflowQuestion;
  currentStep: number;
  initialData?: RepeatingGroupEntry;
  onComplete: (data: RepeatingGroupEntry) => void;
  onCancel: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  isLastQuestion: boolean;
  children: React.ReactNode;
}

export function RepeatingGroupQuestionProvider({
  question,
  currentStep,
  initialData = {},
  onComplete,
  onCancel,
  onNextStep,
  onPreviousStep,
  isLastQuestion,
  children
}: RepeatingGroupQuestionProviderProps) {
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({
    ...initialData
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  const [isNavigating, setIsNavigating] = useState(false);

  // Inizializzare le opzioni visibili e controllare gli errori di validazione
  useEffect(() => {
    const initialVisibleOptions: { [key: string]: boolean } = {};
    const initialValidationErrors: { [key: string]: boolean } = {};
    
    if (question && question.placeholders) {
      Object.keys(question.placeholders).forEach(key => {
        const placeholder = question.placeholders[key];
        const value = responses[key];
        
        // Se non c'è un valore, imposta l'opzione come visibile
        initialVisibleOptions[key] = value === undefined || value === "";
        
        // Controlla la validazione per gli input
        if (placeholder.type === "input" && value !== undefined && value !== "") {
          const validationType = (placeholder as any).input_validation as ValidationTypes;
          if (validationType && !validateInput(value as string, validationType)) {
            initialValidationErrors[key] = true;
          }
        }
      });
    }
    
    setVisibleOptions(initialVisibleOptions);
    setValidationErrors(initialValidationErrors);
    setIsNavigating(false);
  }, [question, responses]);

  // Funzione per gestire il cambio di valore di un placeholder
  const handleValueChange = (placeholderKey: string, value: string | number) => {
    setResponses(prev => ({
      ...prev,
      [placeholderKey]: value
    }));
    
    // Valida l'input se necessario
    if (question.placeholders[placeholderKey].type === "input" && typeof value === "string") {
      const placeholder = question.placeholders[placeholderKey];
      const validationType = (placeholder as any).input_validation;
      const isValid = validateInput(value, validationType);
      
      setValidationErrors(prev => ({
        ...prev,
        [placeholderKey]: !isValid
      }));
      
      // Nascondi le opzioni se valido
      if (isValid) {
        setVisibleOptions(prev => ({
          ...prev,
          [placeholderKey]: false
        }));
      }
    } else {
      // Per i select o altri tipi, nascondi sempre le opzioni
      setVisibleOptions(prev => ({
        ...prev,
        [placeholderKey]: false
      }));
    }
  };
  
  // Funzione per gestire il click su un placeholder
  const handlePlaceholderClick = (key: string) => {
    setVisibleOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Funzione per verificare se il passaggio corrente è valido
  const isCurrentStepValid = () => {
    if (!question || !question.placeholders) return false;
    
    const placeholderKeys = Object.keys(question.placeholders);
    
    // Controlla che tutti i placeholder abbiano un valore valido
    return placeholderKeys.every(key => {
      const placeholder = question.placeholders[key];
      const value = responses[key];
      
      // Se è un placeholder di tipo input, verifica la validità del valore
      if (placeholder.type === "input") {
        if (value === undefined || value === "") return false;
        const validationType = (placeholder as any).input_validation;
        return validateInput(String(value), validationType);
      }
      
      // Per i placeholder di tipo select, verifica che sia stato selezionato un valore
      return value !== undefined && value !== "";
    });
  };
  
  // Gestisce il prossimo passo
  const handleNextStep = () => {
    if (isNavigating) return;
    
    // Valida il passaggio corrente
    if (!isCurrentStepValid()) {
      return;
    }
    
    setIsNavigating(true);
    
    if (isLastQuestion) {
      // Se è l'ultima domanda, completa il subflow
      onComplete({...responses, id: responses.id || initialData.id});
    } else {
      // Determina il prossimo passaggio in base alla priorità del placeholder
      const priorityKey = question.leads_to_placeholder_priority;
      if (priorityKey && question.placeholders[priorityKey]) {
        const placeholder = question.placeholders[priorityKey];
        const value = responses[priorityKey];
        
        // Se è un placeholder di tipo select, trova la giusta destinazione
        if (placeholder.type === "select" && value !== undefined) {
          const selectedOption = (placeholder as any).options.find(
            (opt: any) => opt.id === value
          );
          
          if (selectedOption?.leads_to === "end_of_subflow") {
            // Completa il subflow e invia i dati
            onComplete({...responses, id: responses.id || initialData.id});
            return;
          }
        }
        
        // Se è un placeholder di tipo input con un leads_to specificato
        if (placeholder.type === "input" && (placeholder as any).leads_to === "end_of_subflow") {
          onComplete({...responses, id: responses.id || initialData.id});
          return;
        }
      }
      
      // Vai al prossimo passaggio
      onNextStep();
    }
    
    setIsNavigating(false);
  };
  
  // Gestisce il passo precedente
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      onPreviousStep();
    } else {
      onCancel();
    }
  };
  
  // Ottiene un messaggio di errore basato sul tipo di validazione
  const getValidationErrorMessage = (validationType: ValidationTypes): string => {
    switch (validationType) {
      case 'euro':
        return 'Inserire un numero intero positivo';
      case 'month':
        return 'Inserire un mese valido in italiano';
      case 'year':
        return 'Inserire un anno tra 1900 e 2150';
      case 'age':
        return 'Inserire un\'età tra 16 e 100 anni';
      case 'city':
        return 'Inserire un nome di città valido';
      case 'cap':
        return 'Inserire un CAP valido (5 cifre)';
      default:
        return 'Valore non valido';
    }
  };

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
