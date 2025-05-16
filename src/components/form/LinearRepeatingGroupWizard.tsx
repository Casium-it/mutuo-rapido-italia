
import React, { useState, useEffect } from "react";
import { SubflowQuestion, RepeatingGroupEntry } from "@/types/form";
import { ArrowRight, Check, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateInput } from "@/utils/validationUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LinearRepeatingGroupWizardProps {
  questions: SubflowQuestion[];
  initialData?: RepeatingGroupEntry;
  onComplete: (data: RepeatingGroupEntry) => void;
  onCancel: () => void;
  completeButtonText?: string;
  cancelButtonText?: string;
}

export function LinearRepeatingGroupWizard({
  questions,
  initialData = {},
  onComplete,
  onCancel,
  completeButtonText = "Aggiungi elemento",
  cancelButtonText = "Annulla"
}: LinearRepeatingGroupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RepeatingGroupEntry>({
    ...initialData,
    id: initialData.id || undefined
  });
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  
  const currentQuestion = questions[currentStep];
  
  // Effetto per impostare la visibilità iniziale delle opzioni
  useEffect(() => {
    const initialVisibleOptions: { [key: string]: boolean } = {};
    const initialValidationErrors: { [key: string]: boolean } = {};
    
    Object.keys(currentQuestion.placeholders).forEach(key => {
      const existingValue = formData[key];
      if (existingValue) {
        initialVisibleOptions[key] = false;
        
        // Verifica che le risposte esistenti siano ancora valide
        if (currentQuestion.placeholders[key].type === "input") {
          const placeholder = currentQuestion.placeholders[key];
          const validationType = (placeholder as any).input_validation;
          if (!validateInput(existingValue as string, validationType)) {
            initialValidationErrors[key] = true;
          }
        }
      } else {
        initialVisibleOptions[key] = true;
      }
    });
    
    setVisibleOptions(initialVisibleOptions);
    setValidationErrors(initialValidationErrors);
  }, [currentStep, currentQuestion, formData]);
  
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
      
      // Nascondi le opzioni se valido
      if (isValid) {
        setVisibleOptions(prev => ({
          ...prev,
          [placeholderKey]: false
        }));
      }
    } else if (placeholder.type === "select") {
      setVisibleOptions(prev => ({
        ...prev,
        [placeholderKey]: false
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
  
  const handlePlaceholderClick = (key: string) => {
    setVisibleOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
  
  // Renderizza i select options visibili
  const renderVisibleSelectOptions = (key: string, placeholder: any) => {
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
                  formData[key] === option.id
                    ? "border-black bg-gray-50"
                    : "border-[#BEB8AE]"
                )}
                onClick={() => handleValueChange(key, option.id)}
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
      if (currentQuestion.placeholders[placeholderKey]) {
        if (currentQuestion.placeholders[placeholderKey].type === "select") {
          // Renderizza box selezionabile per opzioni
          const placeholder = currentQuestion.placeholders[placeholderKey];
          parts.push(
            <span 
              key={`placeholder-${placeholderKey}`}
              onClick={() => handlePlaceholderClick(placeholderKey)}
              className="cursor-pointer"
            >
              <SelectPlaceholderBox
                questionId={`${currentQuestion.question_id}_temp`}
                placeholderKey={placeholderKey}
                options={(placeholder as any).options}
                className={formData[placeholderKey] ? "" : "bg-[#F8F4EF] text-[#C4BFB8]"}
              />
            </span>
          );
        } else if (currentQuestion.placeholders[placeholderKey].type === "input") {
          // Renderizza campo input inline con validazione
          const placeholder = currentQuestion.placeholders[placeholderKey] as any;
          const value = formData[placeholderKey] as string || "";
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
                      onChange={(e) => handleValueChange(placeholderKey, e.target.value)}
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
  
  return (
    <div className="max-w-xl animate-fade-in">
      {/* Note della domanda */}
      {renderQuestionNotes()}
      
      {/* Testo della domanda */}
      <div className="text-[16px] font-normal text-gray-900 mb-5 leading-relaxed">
        {renderQuestionText()}
      </div>
      
      {/* Linea separatrice */}
      <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />
      
      {/* Contenitore per i select options visibili */}
      <div className="space-y-5">
        {Object.keys(currentQuestion.placeholders).map(key => renderVisibleSelectOptions(key, currentQuestion.placeholders[key]))}
      </div>
      
      {/* Pulsanti di navigazione */}
      <div className="flex justify-between pt-4 mt-8">
        <Button
          type="button"
          onClick={handlePreviousStep}
          variant="outline"
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-[18px] py-[12px] rounded-[10px] text-[16px] font-medium inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? cancelButtonText : 'Indietro'}
        </Button>
        
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={!isCurrentStepValid()}
          className={cn(
            "bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[32px] py-[16px] rounded-[12px] text-[17px] font-medium",
            "transition-all shadow-[0_6px_12px_rgba(36,92,79,0.2)] hover:shadow-[0_8px_16px_rgba(36,92,79,0.25)]",
            "inline-flex items-center gap-[12px]",
            !isCurrentStepValid() && "opacity-50 cursor-not-allowed"
          )}
        >
          {currentStep < questions.length - 1 ? (
            <>
              Avanti <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {initialData.id ? 'Salva modifiche' : completeButtonText}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
