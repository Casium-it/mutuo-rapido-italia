import React, { useState, useEffect } from "react";
import { useFormExtended } from "@/hooks/useFormExtended";
import { Question, ValidationTypes } from "@/types/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useParams } from "react-router-dom";
import { cn, formatNumberWithThousandSeparator, capitalizeWords } from "@/lib/utils";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { Separator } from "@/components/ui/separator";
import { getQuestionTextWithClickableResponses } from "@/utils/formUtils";
import { validateInput } from "@/utils/validationUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MultiBlockManager } from "./MultiBlockManager";
import { CompleteFormButton } from "./CompleteFormButton";

// Funzione per formattare il valore da visualizzare in base al tipo di validazione
const formatDisplayValue = (value: string, validationType: ValidationTypes): string => {
  if (!value) return "";
  
  switch (validationType) {
    case "euro":
      return formatNumberWithThousandSeparator(value);
    case "city":
    case "month":
      return capitalizeWords(value);
    default:
      return value;
  }
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
    addActiveBlock, 
    goToQuestion,
    markBlockAsCompleted
  } = useFormExtended();
  
  const [responses, setResponses] = useState<{ [key: string]: string | string[] }>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: boolean }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  const [editingFields, setEditingFields] = useState<{ [key: string]: boolean }>({});
  const params = useParams();

  useEffect(() => {
    const existingResponses: { [key: string]: string | string[] } = {};
    const initialVisibleOptions: { [key: string]: boolean } = {};
    const initialValidationErrors: { [key: string]: boolean } = {};
    
    Object.keys(question.placeholders).forEach(key => {
      const existingResponse = getResponse(question.question_id, key);
      if (existingResponse) {
        existingResponses[key] = existingResponse;
        initialVisibleOptions[key] = false;
        
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
  }, [question.question_id, getResponse, question.placeholders]);

  useEffect(() => {
    const hasFineFormPlaceholder = Object.values(question.placeholders).some(
      placeholder => placeholder.type === "FineForm"
    );
    
    if (hasFineFormPlaceholder) {
      markBlockAsCompleted(state.activeQuestion.block_id);
    }
  }, [question.question_id, state.activeQuestion.block_id, markBlockAsCompleted]);

  const handleResponseChange = (key: string, value: string | string[]) => {
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

  const handleInputBlur = (key: string, value: string) => {
    setEditingFields(prev => ({
      ...prev,
      [key]: false
    }));

    if (value === "") {
      return;
    }

    if (question.placeholders[key].type === "input") {
      const placeholder = question.placeholders[key];
      const validationType = (placeholder as any).input_validation as ValidationTypes;
      
      const isValid = validateInput(value, validationType);
      
      setValidationErrors(prev => ({
        ...prev,
        [key]: !isValid
      }));
      
      if (isValid) {
        setResponse(question.question_id, key, value);
        
        setVisibleOptions(prev => ({
          ...prev,
          [key]: false
        }));
      }
    }
  };

  const handlePlaceholderClick = (key: string) => {
    setVisibleOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputClick = (key: string) => {
    setEditingFields(prev => ({
      ...prev,
      [key]: true
    }));
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
      } else if (priorityResponse && priorityPlaceholder.type === "input" && (priorityPlaceholder as any).leads_to) {
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

  const getQuestionText = () => {
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

  const renderQuestionText = () => {
    if (question.inline === true) {
      const inlineChain = getInlineQuestionChain(
        state.activeQuestion.block_id, 
        state.activeQuestion.question_id
      );
      
      if (inlineChain.length > 0) {
        return (
          <div className="inline">
            {renderQuestionWithResponses(inlineChain[0])}
            {inlineChain.slice(1).map((q, index) => (
              <span key={`inline-${q.question_id}`}>
                {renderQuestionWithResponses(q)}
              </span>
            ))}
            <span className="ml-1">
              {!question.question_text.includes('{{') ? (
                <span>{question.question_text}</span>
              ) : renderQuestionPlaceholders(question.question_text)}
            </span>
          </div>
        );
      }
    }
    
    const fullText = getQuestionText();
    if (!fullText.includes('{{')) {
      return <span>{fullText}</span>;
    }
    
    return renderQuestionPlaceholders(fullText);
  };
  
  const renderQuestionWithResponses = (q: Question) => {
    const { parts } = getQuestionTextWithClickableResponses(q, state.responses);
    
    return (
      <span className="inline">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={`part-${q.question_id}-${index}`}>{part.content}</span>;
          } else {
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
        return '';
      default:
        return 'Valore non valido';
    }
  };
  
  const renderQuestionPlaceholders = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
      }

      const placeholderKey = match[1];
      if (question.placeholders[placeholderKey]) {
        if (question.placeholders[placeholderKey].type === "select") {
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
          const placeholder = question.placeholders[placeholderKey] as any;
          const existingResponse = getResponse(question.question_id, placeholderKey);
          const value = (responses[placeholderKey] as string) || (existingResponse as string) || "";
          const hasError = validationErrors[placeholderKey];
          const isEditing = editingFields[placeholderKey];
          const validationType = placeholder.input_validation;
          const isValid = validateInput(value, validationType);
          
          const getInputWidth = () => {
            const label = placeholder.placeholder_label || "";
            if (validationType === "euro") {
              return "w-[100px]";
            } else if (validationType === "month") {
              return "w-[120px]";
            } else if (placeholder.input_type === "number") {
              return "w-[70px]";
            } else if (placeholder.input_type === "text" && placeholder.placeholder_label?.toLowerCase().includes("cap")) {
              return "w-[120px]";
            } else {
              return "w-[200px]";
            }
          };
          
          if (isValid && value && !isEditing && !hasError) {
            const formattedValue = formatDisplayValue(value, validationType);
            parts.push(
              <span 
                key={`placeholder-${placeholderKey}`}
                className="bg-[#F8F4EF] text-[#245C4F] font-semibold px-[10px] py-[4px] rounded-[6px] text-[16px] cursor-pointer mx-1"
                onClick={() => handleInputClick(placeholderKey)}
              >
                {formattedValue}
              </span>
            );
          } else {
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
                        onBlur={() => handleInputBlur(placeholderKey, value)}
                        placeholder={placeholder.placeholder_label || ""}
                        className={cn(
                          "inline-block align-middle text-center",
                          "border-[1.5px] rounded-[8px]",
                          "text-[16px] text-[#222222] font-['Inter']",
                          "h-[32px] px-[12px] py-[6px]",
                          "outline-none focus:ring-0",
                          "placeholder:text-[#E7E1D9] placeholder:font-normal",
                          "appearance-none",
                          getInputWidth(),
                          {
                            "border-[#E7E1D9]": value === "" && !hasError,
                            "border-[#245C4F] focus:border-[#245C4F]": isEditing && !hasError,
                            "border-red-500": hasError,
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

    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
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

  const allInputsHaveValidContent = () => {
    const inputPlaceholders = Object.keys(question.placeholders).filter(
      key => question.placeholders[key].type === "input"
    );
    
    if (inputPlaceholders.length === 0) {
      return true;
    }
    
    return inputPlaceholders.every(key => {
      const value = responses[key] || getResponse(question.question_id, key);
      
      if (value === undefined || value === "") {
        return false;
      }
      
      if (validationErrors[key]) {
        return false;
      }
      
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
  
  const hasValidResponses = Object.keys(question.placeholders).every(key => 
    (responses[key] !== undefined && responses[key] !== "") || 
    (getResponse(question.question_id, key) !== undefined && getResponse(question.question_id, key) !== "")
  ) && allInputsHaveValidContent();

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
  
  const renderFineFormPlaceholder = () => {
    const fineFormPlaceholders = Object.entries(question.placeholders)
      .filter(([_, placeholder]) => placeholder.type === "FineForm")
      .map(([key, placeholder]) => placeholder as any);
    
    if (fineFormPlaceholders.length === 0) {
      return null;
    }
    
    const fineFormPlaceholder = fineFormPlaceholders[0];
    
    const areAllBlocksCompleted = state.activeBlocks?.every(
      blockId => state.completedBlocks?.includes(blockId)
    );
    
    const incompleteBlocks = state.activeBlocks?.filter(
      blockId => !state.completedBlocks?.includes(blockId)
    ) || [];
    
    return (
      <div className="mt-8 space-y-6">
        {!areAllBlocksCompleted && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  {fineFormPlaceholder.warning_text || "Alcuni blocchi non sono ancora stati completati. Completa tutti i blocchi prima di procedere."}
                </p>
                {incompleteBlocks.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-amber-800">Blocchi da completare:</p>
                    <ul className="mt-1 pl-5 text-sm list-disc text-amber-700">
                      {incompleteBlocks.map(blockId => {
                        const block = state.dynamicBlocks.find(b => b.block_id === blockId) || 
                                    state.blocks.find(b => b.block_id === blockId);
                        return block ? (
                          <li key={blockId} className="cursor-pointer hover:underline" 
                              onClick={() => {
                                const firstQuestion = block.questions[0];
                                if (firstQuestion) {
                                  goToQuestion(blockId, firstQuestion.question_id);
                                }
                              }}>
                            {block.title}
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {areAllBlocksCompleted && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Tutti i blocchi sono stati completati. Puoi procedere con l'invio del form.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <CompleteFormButton className={`w-full ${!areAllBlocksCompleted ? 'opacity-50 cursor-not-allowed' : ''}`} />
        </div>
      </div>
    );
  };
  
  return (
    <div className="max-w-xl animate-fade-in">
      {question.question_notes && (
        <div className="mb-4 bg-[#F8F4EF] rounded-md border-b-4 border-[#BEB8AE] px-4 py-3 text-[14px] font-normal text-gray-700">
          <span className="font-bold">Nota: </span>
          {question.question_notes}
        </div>
      )}
      
      <div className="text-[16px] font-normal text-gray-900 mb-5 leading-relaxed">
        {renderQuestionText()}
      </div>
      
      <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />
      
      {Object.values(question.placeholders).some(placeholder => placeholder.type === "FineForm") ? (
        renderFineFormPlaceholder()
      ) : (
        <>
          <div className="space-y-5">
            {Object.keys(question.placeholders).map(key => renderVisibleSelectOptions(key, question.placeholders[key]))}
          </div>
          
          {renderMultiBlockManagers()}
          
          {hasValidResponses && !Object.values(question.placeholders).some(p => p.type === "MultiBlockManager") && (
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
        </>
      )}
    </div>
  );
}
