
import React, { useState, useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { FormResponse, Question } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateInput } from "@/utils/validationUtils";

interface SubblockInstanceFormProps {
  questions: Question[];
  initialResponses?: FormResponse;
  onSave: (responses: FormResponse) => void;
  onCancel: () => void;
}

export function SubblockInstanceForm({ 
  questions,
  initialResponses = {},
  onSave,
  onCancel
}: SubblockInstanceFormProps) {
  const [responses, setResponses] = useState<FormResponse>(initialResponses);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, Record<string, boolean>>>({});
  
  const currentQuestion = questions[currentQuestionIndex];
  
  useEffect(() => {
    // Inizializza il form con le risposte esistenti, se presenti
    if (Object.keys(initialResponses).length > 0) {
      setResponses(initialResponses);
    }
  }, [initialResponses]);
  
  // Gestisce il cambio di risposta
  const handleResponseChange = (questionId: string, placeholderKey: string, value: string | string[]) => {
    setResponses(prev => {
      const newResponses = { ...prev };
      if (!newResponses[questionId]) {
        newResponses[questionId] = {};
      }
      newResponses[questionId][placeholderKey] = value;
      return newResponses;
    });
    
    // Valida il valore se è un input
    if (currentQuestion.placeholders[placeholderKey].type === "input" && typeof value === "string") {
      const placeholder = currentQuestion.placeholders[placeholderKey];
      const validationType = (placeholder as any).input_validation;
      
      // Verifica la validità dell'input
      const isValid = validateInput(value, validationType);
      
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (!newErrors[questionId]) {
          newErrors[questionId] = {};
        }
        newErrors[questionId][placeholderKey] = !isValid;
        return newErrors;
      });
    }
  };
  
  // Verifica se la domanda corrente ha risposte valide
  const hasValidResponses = () => {
    if (!currentQuestion) return false;
    
    const questionId = currentQuestion.question_id;
    const currentResponses = responses[questionId] || {};
    
    // Se non ci sono placeholder, la domanda è valida
    if (Object.keys(currentQuestion.placeholders).length === 0) {
      return true;
    }
    
    // Verifica che ogni placeholder abbia una risposta valida
    return Object.keys(currentQuestion.placeholders).every(key => {
      // Verifica che ci sia una risposta
      if (!currentResponses[key]) {
        return false;
      }
      
      // Verifica che non ci siano errori di validazione
      if (validationErrors[questionId] && validationErrors[questionId][key]) {
        return false;
      }
      
      return true;
    });
  };
  
  // Naviga alla domanda successiva
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Se siamo all'ultima domanda, salviamo l'istanza
      onSave(responses);
    }
  };
  
  // Naviga alla domanda precedente
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Se siamo alla prima domanda, annulliamo l'operazione
      onCancel();
    }
  };
  
  // Renderizza un placeholder di tipo select
  const renderSelectPlaceholder = (questionId: string, placeholderKey: string, placeholder: any) => {
    const value = responses[questionId]?.[placeholderKey] || "";
    
    return (
      <div className="my-4">
        <div className="mb-2 text-sm font-medium text-gray-700">
          {placeholder.placeholder_label || "Seleziona un'opzione"}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {placeholder.options.map((option: any) => (
            <button
              key={option.id}
              type="button"
              className={`text-left px-4 py-3 border rounded-lg transition-all ${
                value === option.id
                  ? "border-black bg-gray-50"
                  : "border-gray-300"
              }`}
              onClick={() => handleResponseChange(questionId, placeholderKey, option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  // Renderizza un placeholder di tipo input
  const renderInputPlaceholder = (questionId: string, placeholderKey: string, placeholder: any) => {
    const value = responses[questionId]?.[placeholderKey] || "";
    const hasError = validationErrors[questionId]?.[placeholderKey];
    
    return (
      <div className="my-4">
        <div className="mb-2 text-sm font-medium text-gray-700">
          {placeholder.placeholder_label || "Inserisci un valore"}
        </div>
        <Input
          type={placeholder.input_type || "text"}
          value={value}
          onChange={(e) => handleResponseChange(questionId, placeholderKey, e.target.value)}
          className={`w-full ${hasError ? "border-red-500" : ""}`}
        />
        {hasError && (
          <p className="mt-1 text-xs text-red-500">
            Valore non valido
          </p>
        )}
      </div>
    );
  };
  
  // Renderizza i placeholder della domanda corrente
  const renderPlaceholders = () => {
    if (!currentQuestion) return null;
    
    const questionId = currentQuestion.question_id;
    
    return Object.entries(currentQuestion.placeholders).map(([key, placeholder]) => {
      if (placeholder.type === "select") {
        return renderSelectPlaceholder(questionId, key, placeholder);
      } else if (placeholder.type === "input") {
        return renderInputPlaceholder(questionId, key, placeholder);
      }
      return null;
    });
  };
  
  if (!currentQuestion) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4 text-sm font-medium text-gray-500">
        {currentQuestionIndex + 1} di {questions.length}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {currentQuestion.question_text}
      </h3>
      
      {renderPlaceholders()}
      
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
        >
          {currentQuestionIndex === 0 ? "Annulla" : "Indietro"}
        </Button>
        
        <Button
          onClick={handleNextQuestion}
          disabled={!hasValidResponses()}
          className="bg-[#245C4F] hover:bg-[#1e4f44]"
        >
          {currentQuestionIndex < questions.length - 1 ? "Avanti" : "Salva"}
        </Button>
      </div>
    </div>
  );
}
