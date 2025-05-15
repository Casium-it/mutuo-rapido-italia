
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubflowQuestion, RepeatingGroupEntry, Placeholder } from "@/types/form";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { validateInput } from "@/utils/validationUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IncomeSubflowWizardProps {
  questions: SubflowQuestion[];
  initialData?: RepeatingGroupEntry;
  onComplete: (data: RepeatingGroupEntry) => void;
  onCancel: () => void;
}

export function IncomeSubflowWizard({
  questions,
  initialData = {},
  onComplete,
  onCancel
}: IncomeSubflowWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RepeatingGroupEntry>({
    ...initialData,
    id: initialData.id || undefined
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  
  const currentQuestion = questions[currentStep];
  
  // Funzione per gestire il cambio di valore di un placeholder
  const handleValueChange = (placeholderKey: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [placeholderKey]: value
    }));
    
    // Valida l'input se necessario
    const placeholder = currentQuestion.placeholders[placeholderKey];
    if (placeholder.type === "input" && typeof value === "string") {
      const validationType = (placeholder as any).input_validation;
      const isValid = validateInput(value, validationType);
      
      setValidationErrors(prev => ({
        ...prev,
        [placeholderKey]: !isValid
      }));
    }
  };
  
  // Funzione per verificare se il passaggio corrente è valido
  const isCurrentStepValid = () => {
    const placeholderKeys = Object.keys(currentQuestion.placeholders);
    
    // Controlla che tutti i placeholder abbiano un valore
    return placeholderKeys.every(key => {
      const placeholder = currentQuestion.placeholders[key];
      const value = formData[key];
      
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
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    } else {
      onCancel();
    }
  };
  
  const handleNextStep = () => {
    // Valida il passaggio corrente
    if (!isCurrentStepValid()) {
      toast({
        title: "Campi obbligatori",
        description: "Compila correttamente tutti i campi prima di procedere",
        variant: "destructive"
      });
      return;
    }
    
    // Determina il prossimo passaggio in base alla priorità del placeholder
    if (currentStep < questions.length - 1) {
      // Trova il placeholder prioritario
      const priorityKey = currentQuestion.leads_to_placeholder_priority;
      if (priorityKey && currentQuestion.placeholders[priorityKey]) {
        const placeholder = currentQuestion.placeholders[priorityKey];
        const value = formData[priorityKey];
        
        // Se è un placeholder di tipo select, trova la giusta destinazione
        if (placeholder.type === "select" && value !== undefined) {
          const selectedOption = (placeholder as any).options.find(
            (opt: any) => opt.id === value
          );
          
          if (selectedOption?.leads_to === "end_of_subflow") {
            // Completa il subflow e invia i dati
            onComplete(formData);
            return;
          } else if (selectedOption?.leads_to) {
            // Trova l'indice della domanda di destinazione
            const nextQuestionIndex = questions.findIndex(
              q => q.question_id === selectedOption.leads_to
            );
            
            if (nextQuestionIndex !== -1) {
              setCurrentStep(nextQuestionIndex);
              return;
            }
          }
        }
        
        // Se è un placeholder di tipo input con un leads_to specificato
        if (placeholder.type === "input" && (placeholder as any).leads_to) {
          const nextQuestionId = (placeholder as any).leads_to;
          
          if (nextQuestionId === "end_of_subflow") {
            onComplete(formData);
            return;
          }
          
          const nextQuestionIndex = questions.findIndex(
            q => q.question_id === nextQuestionId
          );
          
          if (nextQuestionIndex !== -1) {
            setCurrentStep(nextQuestionIndex);
            return;
          }
        }
      }
      
      // Se non troviamo una logica specifica, vai semplicemente alla prossima domanda
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      // Se siamo all'ultima domanda, completa il subflow
      onComplete(formData);
    }
  };
  
  // Ottiene un messaggio di errore basato sul tipo di validazione
  const getValidationErrorMessage = (validationType: string): string => {
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
  
  // Renderizza un placeholder di tipo select
  const renderSelectPlaceholder = (placeholderKey: string, placeholder: any) => {
    return (
      <div className="space-y-3">
        <Label htmlFor={placeholderKey} className="text-[16px] font-normal text-gray-900 block">
          {placeholder.placeholder_label || "Seleziona un'opzione"}
        </Label>
        <Select
          value={formData[placeholderKey]?.toString() || ""}
          onValueChange={(value) => handleValueChange(placeholderKey, value)}
        >
          <SelectTrigger className="w-full border-[#BEB8AE] focus:border-[#245C4F] focus-visible:ring-0">
            <SelectValue placeholder={placeholder.placeholder_label || "Seleziona un'opzione"} />
          </SelectTrigger>
          <SelectContent>
            {placeholder.options.map((option: any) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  // Renderizza un placeholder di tipo input
  const renderInputPlaceholder = (placeholderKey: string, placeholder: any) => {
    const hasError = validationErrors[placeholderKey];
    const validationType = placeholder.input_validation;
    
    return (
      <div className="space-y-3">
        <Label htmlFor={placeholderKey} className="text-[16px] font-normal text-gray-900 block">
          {placeholder.placeholder_label || "Inserisci un valore"}
        </Label>
        <TooltipProvider>
          <Tooltip open={hasError ? undefined : false}>
            <TooltipTrigger asChild>
              <div className="relative">
                {placeholder.input_validation === "euro" && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                )}
                <Input
                  id={placeholderKey}
                  type={placeholder.input_type || "text"}
                  className={cn(
                    placeholder.input_validation === "euro" ? "pl-7" : "",
                    "border-[#BEB8AE] focus:border-[#245C4F] focus-visible:ring-0",
                    {
                      "border-red-500 focus:border-red-500": hasError,
                    }
                  )}
                  placeholder={placeholder.placeholder_label || ""}
                  value={formData[placeholderKey] || ''}
                  onChange={(e) => {
                    const value = placeholder.input_type === "number" 
                      ? e.target.value !== "" ? parseFloat(e.target.value) : ""
                      : e.target.value;
                    
                    handleValueChange(
                      placeholderKey, 
                      value
                    );
                  }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-red-50 text-red-600 border border-red-200">
              {getValidationErrorMessage(validationType)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };
  
  // Renderizza i placeholder per la domanda corrente
  const renderPlaceholders = () => {
    const placeholders = currentQuestion.placeholders;
    
    return Object.keys(placeholders).map(key => {
      const placeholder = placeholders[key];
      
      if (placeholder.type === "select") {
        return (
          <div key={`placeholder-${key}`} className="mb-4">
            {renderSelectPlaceholder(key, placeholder)}
          </div>
        );
      } else if (placeholder.type === "input") {
        return (
          <div key={`placeholder-${key}`} className="mb-4">
            {renderInputPlaceholder(key, placeholder)}
          </div>
        );
      }
      
      return null;
    });
  };
  
  // Renderizza il testo della domanda, sostituendo i placeholder con i loro valori
  const renderQuestionText = () => {
    const text = currentQuestion.question_text;
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
      parts.push(<span key={`placeholder-${placeholderKey}`} className="text-[#245C4F] font-medium">
        {formData[placeholderKey] || "___"}
      </span>);
      
      lastIndex = match.index + match[0].length;
    }
    
    // Aggiungi il testo rimanente
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }
    
    return parts;
  };
  
  // Renderizza la nota informativa sopra la domanda
  const renderQuestionNotes = () => {
    if (!currentQuestion.question_notes) {
      return null;
    }
    
    return (
      <div className="mb-5 p-4 bg-[#F8F4EF] border-l-4 border-[#245C4F] rounded-md">
        <p className="text-[14px] text-gray-700">{currentQuestion.question_notes}</p>
      </div>
    );
  };
  
  return (
    <div className="max-w-xl animate-fade-in">
      <div className="mb-5">
        <h2 className="text-[22px] font-semibold text-gray-900 mb-2">
          {renderQuestionText()}
        </h2>
        <Separator className="h-[1px] bg-[#F0EAE0] my-5" />
      </div>
      
      {/* Note della domanda */}
      {renderQuestionNotes()}
      
      {/* Placeholders della domanda */}
      <div className="space-y-6 mb-8">
        {renderPlaceholders()}
      </div>
      
      {/* Pulsanti di navigazione */}
      <div className="flex justify-between pt-4 mt-8">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-[18px] py-[12px] rounded-[10px] text-[16px] font-medium inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? 'Annulla' : 'Indietro'}
        </button>
        
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!isCurrentStepValid()}
          className={cn(
            "form-next-button",
            !isCurrentStepValid() && "opacity-50 cursor-not-allowed"
          )}
        >
          {currentStep < questions.length - 1 ? (
            <>
              Avanti
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              {initialData.id ? 'Salva modifiche' : 'Aggiungi reddito'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
