
import React from "react";
import { Question, SubflowQuestion, ValidationTypes } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuestionContext } from "@/contexts/QuestionContext";

interface QuestionRendererProps {
  question: Question | SubflowQuestion;
  questionText: React.ReactNode;
  renderQuestionParts?: () => React.ReactNode;
  showNavigationButtons?: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  completeButtonText?: string;
  cancelButtonText?: string;
  isLastQuestion?: boolean;
}

export function QuestionRenderer({
  question,
  questionText,
  renderQuestionParts,
  showNavigationButtons = true,
  nextButtonText = "Avanti",
  prevButtonText = "Indietro",
  completeButtonText = "Completa",
  cancelButtonText = "Annulla",
  isLastQuestion = false
}: QuestionRendererProps) {
  const {
    responses,
    validationErrors,
    visibleOptions,
    handleValueChange,
    handlePlaceholderClick,
    handleNextStep,
    handlePreviousStep,
    isCurrentStepValid,
    isNavigating,
    getValidationErrorMessage
  } = useQuestionContext();

  // Funzione per renderizzare la nota informativa sopra la domanda
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
                  responses[key] === option.id
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

  return (
    <div className="max-w-xl animate-fade-in">
      {/* Banner note della domanda */}
      {renderQuestionNotes()}
      
      {/* Testo della domanda */}
      <div className="text-[16px] font-normal text-gray-900 mb-5 leading-relaxed">
        {questionText}
      </div>
      
      {/* Linea separatrice beige */}
      <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />
      
      {/* Contenitore per i select options visibili */}
      <div className="space-y-5">
        {question.placeholders && Object.keys(question.placeholders).map(key => 
          renderVisibleSelectOptions(key, question.placeholders[key])
        )}
        
        {/* Custom renderer per parti specifiche di domande */}
        {renderQuestionParts && renderQuestionParts()}
      </div>
      
      {/* Pulsanti di navigazione */}
      {showNavigationButtons && isCurrentStepValid() && (
        <div className="flex justify-between pt-4 mt-8">
          <button
            type="button"
            onClick={handlePreviousStep}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-[18px] py-[12px] rounded-[10px] text-[16px] font-medium inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {prevButtonText}
          </button>
          
          <button
            type="button"
            onClick={handleNextStep}
            disabled={isNavigating}
            className={cn(
              "bg-[#245C4F] hover:bg-[#1A453A] text-white px-[18px] py-[12px] rounded-[10px] text-[16px] font-medium inline-flex items-center",
              isNavigating && "opacity-50 cursor-not-allowed"
            )}
          >
            {!isLastQuestion ? (
              <>
                {nextButtonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {completeButtonText}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Componenti di utilità per renderizzare i placeholder
export function RenderInputPlaceholder({
  placeholderKey, 
  placeholder
}: {
  placeholderKey: string;
  placeholder: any;
}) {
  const { responses, validationErrors, handleValueChange, getValidationErrorMessage } = useQuestionContext();
  const hasError = validationErrors[placeholderKey];
  const validationType = placeholder.input_validation;
  
  return (
    <div className="space-y-3">
      <label htmlFor={placeholderKey} className="text-[16px] font-normal text-gray-900 block">
        {placeholder.placeholder_label || "Inserisci un valore"}
      </label>
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
                value={responses[placeholderKey] || ''}
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
}

export function RenderSelectPlaceholder({
  placeholderKey,
  placeholder
}: {
  placeholderKey: string;
  placeholder: any;
}) {
  const { responses, handleValueChange } = useQuestionContext();
  
  return (
    <div className="space-y-3">
      <label htmlFor={placeholderKey} className="text-[16px] font-normal text-gray-900 block">
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
              responses[placeholderKey] === option.id
                ? "border-black bg-gray-50"
                : "border-[#BEB8AE]"
            )}
            onClick={() => handleValueChange(placeholderKey, option.id)}
          >
            <div className="font-medium text-black">{option.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
