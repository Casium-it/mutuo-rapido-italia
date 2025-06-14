import React, { useState, useEffect } from "react";
import { useForm } from "@/contexts/FormContext";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SelectPlaceholderInput } from "./SelectPlaceholderInput";
import { SelectPlaceholderBox } from "./SelectPlaceholderBox";
import { MultiBlockManager } from "./MultiBlockManager";
import { FormSubmitButton } from "./FormSubmitButton";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useForm as useFormHook } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Question, Option } from "@/types/form";
import { useNavigate, useParams } from "react-router-dom";
import { trackSimulationReply, trackBackNavigation, trackChangeResponse } from "@/utils/analytics";

interface FormQuestionProps {
  question: Question;
}

export function FormQuestion({ question }: FormQuestionProps) {
  const { state, dispatch, getResponse, setResponse, blocks } = useForm();
  const navigate = useNavigate();
  const params = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [responses, setResponses] = useState<Record<string, string | number | boolean | null>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Sync URL with question ID
  useEffect(() => {
    const newUrl = `/form/${params.blockType}/${state.activeQuestion.question_id}`;
    if (window.location.pathname !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [state.activeQuestion.question_id, params.blockType, navigate]);

  // Track question start time when question loads
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [state.activeQuestion.block_id, state.activeQuestion.question_id]);

  const findQuestionById = (questionId: string) => {
    for (const block of blocks) {
      const foundQuestion = block.questions.find(q => q.question_id === questionId);
      if (foundQuestion) {
        return foundQuestion;
      }
    }
    return null;
  };

  const getNextQuestionId = (): string | null => {
    const currentBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);
    if (!currentBlock) return null;

    const currentQuestionIndex = currentBlock.questions.findIndex(q => q.question_id === state.activeQuestion.question_id);
    if (currentQuestionIndex === -1) return null;

    if (currentQuestionIndex < currentBlock.questions.length - 1) {
      return currentBlock.questions[currentQuestionIndex + 1].question_id;
    }

    // If it's the last question in the block, find the next block
    const currentBlockIndex = blocks.findIndex(block => block.block_id === currentBlock.block_id);
    if (currentBlockIndex < blocks.length - 1) {
      const nextBlock = blocks[currentBlockIndex + 1];
      return nextBlock.questions[0].question_id; // First question of the next block
    }

    return null; // No more questions
  };

  const getPrevQuestionId = (): string | null => {
    const currentBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);
    if (!currentBlock) return null;

    const currentQuestionIndex = currentBlock.questions.findIndex(q => q.question_id === state.activeQuestion.question_id);
    if (currentQuestionIndex > 0) {
      return currentBlock.questions[currentQuestionIndex - 1].question_id;
    }

    // If it's the first question in the block, find the previous block
    const currentBlockIndex = blocks.findIndex(block => block.block_id === currentBlock.block_id);
    if (currentBlockIndex > 0) {
      const prevBlock = blocks[currentBlockIndex - 1];
      return prevBlock.questions[prevBlock.questions.length - 1].question_id; // Last question of the previous block
    }

    return null; // No previous questions
  };

  const handleNextQuestion = () => {
    // Track simulation reply with time in seconds
    const replyTimeSeconds = Math.floor((Date.now() - questionStartTime) / 1000);
    const responseValue = Object.entries(responses)
      .map(([key, value]) => `${key}:${value}`)
      .join(', ');
    
    trackSimulationReply(
      state.activeQuestion.block_id,
      state.activeQuestion.question_id,
      replyTimeSeconds,
      responseValue
    );

    const nextQuestionId = getNextQuestionId();

    if (nextQuestionId) {
      dispatch({
        type: "SET_ACTIVE_QUESTION",
        payload: {
          block_id: findQuestionById(nextQuestionId)?.block_id || state.activeQuestion.block_id,
          question_id: nextQuestionId
        }
      });
      setIsEditMode(false);
    } else {
      // If no more questions, submit the form
      dispatch({ type: "SET_FORM_COMPLETED", payload: true });
      navigate("/form-completed", { state: { submissionData: state.submission } });
    }
  };

  const handleNonLoSoClick = () => {
    const nextQuestionId = getNextQuestionId();

    setResponses({});
    Object.keys(question.placeholders).forEach(key => {
      setResponse(question.question_id, key, null);
    });

    if (nextQuestionId) {
      dispatch({
        type: "SET_ACTIVE_QUESTION",
        payload: {
          block_id: findQuestionById(nextQuestionId)?.block_id || state.activeQuestion.block_id,
          question_id: nextQuestionId
        }
      });
      setIsEditMode(false);
    } else {
      dispatch({ type: "SET_FORM_COMPLETED", payload: true });
      navigate("/form-completed", { state: { submissionData: state.submission } });
    }
  };

  const handleBackNavigation = () => {
    const prevQuestionId = getPrevQuestionId();
    const prevQuestion = prevQuestionId ? findQuestionById(prevQuestionId) : null;

    // Track back navigation
    if (prevQuestion) {
      trackBackNavigation(
        state.activeQuestion.block_id,
        state.activeQuestion.question_id,
        prevQuestion.block_id,
        prevQuestion.question_id
      );
    }

    if (prevQuestionId) {
      dispatch({
        type: "SET_ACTIVE_QUESTION",
        payload: {
          block_id: findQuestionById(prevQuestionId)?.block_id || state.activeQuestion.block_id,
          question_id: prevQuestionId
        }
      });
      setIsEditMode(false);
    }
  };

  const handlePlaceholderClick = (key: string) => {
    // Check if this is editing an existing response
    const existingResponse = getResponse(question.question_id, key);
    
    if (existingResponse !== undefined && existingResponse !== null && existingResponse !== '') {
      // Track response change
      trackChangeResponse(
        state.activeQuestion.block_id,
        state.activeQuestion.question_id,
        key,
        String(existingResponse)
      );
    }

    setIsEditMode(true);
    setResponses(prevResponses => ({
      ...prevResponses,
      [key]: getResponse(question.question_id, key) || ''
    }));
  };

  const handleInputChange = (key: string, value: string | number | boolean | null) => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [key]: value
    }));
  };

  const handleSaveResponse = () => {
    Object.keys(responses).forEach(key => {
      setResponse(question.question_id, key, responses[key]);
    });
    setIsEditMode(false);
    setResponses({});
  };

  const isLastQuestion = !getNextQuestionId();

  return (
    <div className="space-y-4">
      <p className="text-gray-700 leading-relaxed">{question.text}</p>

      {Object.keys(question.placeholders).map(key => {
        const placeholder = question.placeholders[key];
        const response = getResponse(question.question_id, key);

        if (isEditMode) {
          return (
            <div key={key}>
              {placeholder.type === 'select' ? (
                <SelectPlaceholderInput
                  placeholderKey={key}
                  placeholder={placeholder}
                  response={response}
                  onChange={handleInputChange}
                  value={String(responses[key] || '')}
                />
              ) : (
                <FormField
                  key={key}
                  control={useFormHook().control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{placeholder.label}</FormLabel>
                      <FormControl>
                        <input
                          type={placeholder.type}
                          className="border border-gray-300 rounded px-4 py-2 w-full"
                          value={String(responses[key] || '')}
                          onChange={(e) => handleInputChange(key, e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          );
        } else {
          return (
            <SelectPlaceholderBox
              key={key}
              placeholderKey={key}
              placeholder={placeholder}
              response={response}
              onClick={() => handlePlaceholderClick(key)}
            />
          );
        }
      })}

      {isEditMode && (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setIsEditMode(false)}>
            Annulla
          </Button>
          <Button size="sm" onClick={handleSaveResponse}>
            Salva
          </Button>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleBackNavigation} disabled={!getPrevQuestionId()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Indietro
        </Button>
        <div>
          <Button variant="secondary" size="sm" onClick={handleNonLoSoClick}>
            Non lo so
          </Button>
          <Button size="sm" onClick={handleNextQuestion} disabled={isEditMode}>
            Avanti
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLastQuestion && <FormSubmitButton />}
      <MultiBlockManager />
    </div>
  );
}
