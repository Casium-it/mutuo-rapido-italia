
import React, { useState, useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { Question } from "@/types/form";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";

interface IntegratedQuestionViewProps {
  mainQuestion: Question;
  inlineQuestions: { question: Question; previousResponse: string | string[] | undefined }[];
  getLeadsToFromResponse: (
    question: Question,
    placeholderKey: string,
    response: string | string[] | undefined
  ) => string | undefined;
}

export function IntegratedQuestionView({
  mainQuestion,
  inlineQuestions,
  getLeadsToFromResponse,
}: IntegratedQuestionViewProps) {
  const { state, getResponse, setResponse, navigateToNextQuestion, addActiveBlock } = useForm();
  const [responses, setResponses] = useState<{ [questionId: string]: { [key: string]: string | string[] } }>({});
  const [visibleOptions, setVisibleOptions] = useState<{ [questionId: string]: { [key: string]: boolean } }>({});

  // Inizializza le risposte e lo stato di visibilità delle opzioni per ogni domanda
  useEffect(() => {
    const initialResponses: { [questionId: string]: { [key: string]: string | string[] } } = {};
    const initialVisibleOptions: { [questionId: string]: { [key: string]: boolean } } = {};

    // Inizializza per la domanda principale
    initialResponses[mainQuestion.question_id] = {};
    initialVisibleOptions[mainQuestion.question_id] = {};

    Object.keys(mainQuestion.placeholders).forEach(key => {
      const existingResponse = getResponse(mainQuestion.question_id, key);
      if (existingResponse) {
        initialResponses[mainQuestion.question_id][key] = existingResponse;
        initialVisibleOptions[mainQuestion.question_id][key] = false;
      } else {
        initialVisibleOptions[mainQuestion.question_id][key] = true;
      }
    });

    // Inizializza per le domande inline
    inlineQuestions.forEach(({ question }) => {
      initialResponses[question.question_id] = {};
      initialVisibleOptions[question.question_id] = {};

      Object.keys(question.placeholders).forEach(key => {
        const existingResponse = getResponse(question.question_id, key);
        if (existingResponse) {
          initialResponses[question.question_id][key] = existingResponse;
          initialVisibleOptions[question.question_id][key] = false;
        } else {
          initialVisibleOptions[question.question_id][key] = true;
        }
      });
    });

    setResponses(initialResponses);
    setVisibleOptions(initialVisibleOptions);
  }, [mainQuestion.question_id, inlineQuestions, getResponse]);

  // Funzione per gestire il cambio di risposta
  const handleResponseChange = (questionId: string, key: string, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [key]: value
      }
    }));

    // Salva la risposta nel contesto globale
    setResponse(questionId, key, value);

    // Nascondi le opzioni dopo la selezione
    setVisibleOptions(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [key]: false
      }
    }));

    // Gestisci l'attivazione di blocchi aggiuntivi
    const question = questionId === mainQuestion.question_id 
      ? mainQuestion 
      : inlineQuestions.find(q => q.question.question_id === questionId)?.question;

    if (question && question.placeholders[key].type === "select" && !Array.isArray(value)) {
      const selectedOption = (question.placeholders[key] as any).options.find(
        (opt: any) => opt.id === value
      );

      if (selectedOption?.add_block) {
        addActiveBlock(selectedOption.add_block);
      }
    }
  };

  // Funzione per mostrare/nascondere le opzioni di selezione
  const handlePlaceholderClick = (questionId: string, key: string) => {
    setVisibleOptions(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [key]: !prev[questionId]?.[key]
      }
    }));
  };

  // Metodo per renderizzare il testo con i placeholder
  const renderQuestionText = (question: Question, questionId: string) => {
    if (!question.question_text.includes('{{')) {
      return <span>{question.question_text}</span>;
    }

    const parts = [];
    let lastIndex = 0;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(question.question_text)) !== null) {
      // Aggiungi testo prima del placeholder
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{question.question_text.slice(lastIndex, match.index)}</span>);
      }

      const placeholderKey = match[1];
      if (question.placeholders[placeholderKey]) {
        if (question.placeholders[placeholderKey].type === "select") {
          // Renderizza SelectPlaceholderBox per select
          const placeholder = question.placeholders[placeholderKey];
          parts.push(
            <span 
              key={`placeholder-${placeholderKey}`}
              onClick={() => handlePlaceholderClick(questionId, placeholderKey)}
              className="cursor-pointer mx-1"
            >
              <SelectPlaceholderBox
                questionId={questionId}
                placeholderKey={placeholderKey}
                options={(placeholder as any).options}
                className="text-[16px] py-0"
              />
            </span>
          );
        } else if (question.placeholders[placeholderKey].type === "input") {
          // Renderizza campo input inline
          const placeholder = question.placeholders[placeholderKey];
          const existingResponse = getResponse(questionId, placeholderKey);
          const value = (responses[questionId]?.[placeholderKey] as string) || (existingResponse as string) || "";
          
          parts.push(
            <span 
              key={`placeholder-${placeholderKey}`}
              className="inline-block align-middle mx-1"
            >
              <Input
                type={(placeholder as any).input_type || "text"}
                value={value}
                onChange={(e) => handleResponseChange(questionId, placeholderKey, e.target.value)}
                placeholder={(placeholder as any).placeholder_label || ""}
                className={cn(
                  "inline-block align-middle text-center",
                  "border-[1.5px] border-[#245C4F] rounded-[8px]",
                  "text-[16px] text-[#222222] font-['Inter']",
                  "h-[48px] px-[12px] py-[10px]",
                  "outline-none focus:ring-0 focus:border-[#245C4F]",
                  "placeholder:text-[#E7E1D9] placeholder:font-normal",
                  {
                    "w-[70px]": (placeholder as any).input_type === "number",
                    "w-[120px]": (placeholder as any).input_type === "text" && (placeholder as any).placeholder_label?.toLowerCase().includes("cap"),
                    "w-[200px]": (placeholder as any).input_type === "text" && !(placeholder as any).placeholder_label?.toLowerCase().includes("cap"),
                  }
                )}
              />
            </span>
          );
        } else {
          // Fallback per altri tipi di placeholder
          parts.push(<span key={`placeholder-${placeholderKey}`} className="mx-1 px-1 py-0 bg-gray-100 rounded text-[16px]">_____</span>);
        }
      } else {
        // Fallback se la chiave non esiste nei placeholders
        parts.push(<span key={`placeholder-${placeholderKey}`} className="mx-1 px-1 py-0 bg-gray-100 rounded text-[16px]">_____</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Aggiungi il testo rimanente dopo l'ultimo placeholder
    if (lastIndex < question.question_text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{question.question_text.slice(lastIndex)}</span>);
    }

    return <>{parts}</>;
  };

  // Renderizza le opzioni di selezione visibili per una domanda
  const renderVisibleSelectOptions = (questionId: string, placeholderKey: string, placeholder: any) => {
    const existingResponse = getResponse(questionId, placeholderKey);
    
    if (placeholder.type === "select" && visibleOptions[questionId]?.[placeholderKey]) {
      return (
        <div key={`select-${placeholderKey}`} className="mt-3">
          <label className="block text-[16px] font-medium text-gray-700 mb-2">
            {placeholder.placeholder_label || "Seleziona un'opzione"}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {placeholder.options.map((option) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "text-left px-[18px] py-[12px] border-[1.5px] rounded-[10px] transition-all font-['Inter'] text-[16px] font-normal",
                  "shadow-[0_3px_0_0_#AFA89F] mb-[10px] cursor-pointer w-fit",
                  "hover:shadow-[0_3px_4px_rgba(175,168,159,0.25)]",
                  responses[questionId]?.[placeholderKey] === option.id || existingResponse === option.id
                    ? "border-black bg-gray-50"
                    : "border-[#BEB8AE]"
                )}
                onClick={() => handleResponseChange(questionId, placeholderKey, option.id)}
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

  // Ottieni la risposta precedente come testo leggibile
  const getPreviousSelectionLabel = (questionId: string, previousResponse: string | string[] | undefined) => {
    // Trova la domanda corrispondente
    const inlineQuestion = inlineQuestions.find(q => q.question.question_id === questionId);
    
    if (!inlineQuestion || !previousResponse) return null;
    
    // Trova la domanda precedente
    const prevQuestionIndex = inlineQuestions.findIndex(q => q.question.question_id === questionId) - 1;
    let prevQuestion: Question;
    
    if (prevQuestionIndex === -1) {
      // Se è la prima inline, la precedente è la domanda principale
      prevQuestion = mainQuestion;
    } else {
      // Altrimenti è un'altra inline question
      prevQuestion = inlineQuestions[prevQuestionIndex].question;
    }
    
    // Per le risposte di tipo select, trova il label dell'opzione selezionata
    const placeholderKey = Object.keys(prevQuestion.placeholders)[0];
    if (prevQuestion.placeholders[placeholderKey].type === "select" && !Array.isArray(previousResponse)) {
      const options = (prevQuestion.placeholders[placeholderKey] as any).options;
      const selectedOption = options.find((opt: any) => opt.id === previousResponse);
      return selectedOption?.label;
    }
    
    // Per input, ritorna direttamente il valore
    return previousResponse.toString();
  };

  // Determina se ci sono risposte valide per mostrare il pulsante Avanti
  const checkAllQuestionsAnswered = () => {
    // Verifica la domanda principale
    const mainQuestionAnswered = Object.keys(mainQuestion.placeholders).every(key => 
      responses[mainQuestion.question_id]?.[key] !== undefined || getResponse(mainQuestion.question_id, key) !== undefined
    );
    
    if (!mainQuestionAnswered || inlineQuestions.length === 0) {
      return mainQuestionAnswered;
    }
    
    // Verifica tutte le domande inline
    return inlineQuestions.every(follow => {
      const questionId = follow.question.question_id;
      return Object.keys(follow.question.placeholders).every(key => 
        responses[questionId]?.[key] !== undefined || getResponse(questionId, key) !== undefined
      );
    });
  };

  // Gestisce la navigazione alla prossima domanda
  const handleNextQuestion = () => {
    if (state.isNavigating) return;
    
    // Se ci sono domande inline, verifica l'ultima per la navigazione
    if (inlineQuestions.length > 0) {
      const lastInlineQuestion = inlineQuestions[inlineQuestions.length - 1].question;
      const lastKey = Object.keys(lastInlineQuestion.placeholders)[0];
      
      if (lastInlineQuestion.placeholders[lastKey].type === "select") {
        const response = getResponse(lastInlineQuestion.question_id, lastKey) || 
                        responses[lastInlineQuestion.question_id]?.[lastKey];
        
        if (response && !Array.isArray(response)) {
          const options = (lastInlineQuestion.placeholders[lastKey] as any).options;
          const selectedOption = options.find((opt: any) => opt.id === response);
          
          if (selectedOption?.leads_to) {
            navigateToNextQuestion(lastInlineQuestion.question_id, selectedOption.leads_to);
            return;
          }
        }
      } else if (lastInlineQuestion.placeholders[lastKey].type === "input") {
        const leadsTo = (lastInlineQuestion.placeholders[lastKey] as any).leads_to;
        if (leadsTo) {
          navigateToNextQuestion(lastInlineQuestion.question_id, leadsTo);
          return;
        }
      }
      
      // Se non c'è un leads_to specifico, vai al prossimo blocco
      navigateToNextQuestion(lastInlineQuestion.question_id, "next_block");
    } else {
      // Naviga usando la domanda principale
      const mainKey = Object.keys(mainQuestion.placeholders)[0];
      const response = getResponse(mainQuestion.question_id, mainKey) || 
                       responses[mainQuestion.question_id]?.[mainKey];
      
      if (response && mainQuestion.placeholders[mainKey].type === "select" && !Array.isArray(response)) {
        const options = (mainQuestion.placeholders[mainKey] as any).options;
        const selectedOption = options.find((opt: any) => opt.id === response);
        
        if (selectedOption?.leads_to) {
          navigateToNextQuestion(mainQuestion.question_id, selectedOption.leads_to);
          return;
        }
      } else if (response && mainQuestion.placeholders[mainKey].type === "input") {
        const leadsTo = (mainQuestion.placeholders[mainKey] as any).leads_to;
        if (leadsTo) {
          navigateToNextQuestion(mainQuestion.question_id, leadsTo);
          return;
        }
      }
      
      // Se non c'è un leads_to specifico, vai al prossimo blocco
      navigateToNextQuestion(mainQuestion.question_id, "next_block");
    }
  };

  const shouldShowNextButton = checkAllQuestionsAnswered();

  return (
    <div className="max-w-2xl">
      <div className="space-y-4 animate-fade-in">
        {/* Domanda principale */}
        <div className="text-[16px] font-normal text-gray-900 mb-4 leading-relaxed">
          {renderQuestionText(mainQuestion, mainQuestion.question_id)}
        </div>

        {/* Visualizza le opzioni di selezione per la domanda principale */}
        <div className="space-y-4">
          {Object.keys(mainQuestion.placeholders).map(key => 
            renderVisibleSelectOptions(mainQuestion.question_id, key, mainQuestion.placeholders[key])
          )}
        </div>

        {/* Domande inline integrate nella stessa sezione */}
        {inlineQuestions.length > 0 && (
          <div className="mt-6">
            <Separator className="h-[1px] bg-[#F0EAE0] mb-5" />
            
            {inlineQuestions.map((inlineItem, index) => {
              const { question, previousResponse } = inlineItem;
              const prevLabel = getPreviousSelectionLabel(
                question.question_id, 
                previousResponse
              );
              
              return (
                <div key={question.question_id} className="mt-4">
                  {/* Mostra la selezione precedente */}
                  {prevLabel && (
                    <div className="text-[14px] font-medium text-[#245C4F] mb-1">
                      Hai selezionato: {prevLabel}
                    </div>
                  )}
                  
                  {/* Testo della domanda inline */}
                  <div className="text-[16px] font-normal text-gray-900 mb-3">
                    {renderQuestionText(question, question.question_id)}
                  </div>
                  
                  {/* Opzioni di selezione per la domanda inline */}
                  <div className="space-y-3 ml-1">
                    {Object.keys(question.placeholders).map(key => 
                      renderVisibleSelectOptions(question.question_id, key, question.placeholders[key])
                    )}
                  </div>
                  
                  {/* Separatore tra domande inline, eccetto l'ultima */}
                  {index < inlineQuestions.length - 1 && (
                    <Separator className="h-[1px] bg-[#F0EAE0] my-4" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pulsante Avanti universale (mostrato solo se tutte le domande hanno risposte) */}
        {shouldShowNextButton && (
          <div className="mt-8">
            <Button
              type="button"
              className={cn(
                "bg-[#245C4F] hover:bg-[#1e4f44] text-white px-[32px] py-[16px] rounded-[12px] text-[17px] font-medium",
                "transition-all shadow-[0_6px_12px_rgba(36,92,79,0.2)] hover:shadow-[0_8px_16px_rgba(36,92,79,0.25)]",
                "inline-flex items-center gap-[12px]"
              )}
              onClick={handleNextQuestion}
              disabled={state.isNavigating}
            >
              Avanti <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
