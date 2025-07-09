import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useFormContext } from '@/contexts/FormContext';
import { submitFormToSupabase } from '@/services/formSubmissionService';
import { allBlocks } from '@/data/blocks';
import { Block } from '@/types/form';
import { QuestionComponent } from '@/components/QuestionComponent';

const Form = () => {
  const { 
    blocks,
    state,
    dispatch,
    canGoBack,
    canGoForward,
    goBack,
    goToNextQuestion,
    updateResponse,
    isCurrentQuestionAnswered,
    canCompleteForm,
    linkedFormData
  } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const currentBlock = blocks.find(block => block.block_id === state.activeQuestion.block_id);
  const currentQuestion = currentBlock?.questions.find(question => question.question_id === state.activeQuestion.question_id);

  const handleFormSubmit = async () => {
    if (!canCompleteForm()) return;

    setIsSubmitting(true);
    
    try {
      console.log('🚀 Sottomissione form iniziata');
      
      // Submit form with linked form data
      const result = await submitFormToSupabase(state, blocks, linkedFormData);
      
      if (result.success && result.submissionId) {
        console.log('✅ Form inviato con successo');
        
        // Navigate based on completion behavior
        if (linkedFormData) {
          navigate('/linked-form-completed', { 
            state: { 
              submissionData: { submissionId: result.submissionId },
              linkedFormData 
            } 
          });
        } else {
          navigate('/form-loading', { 
            state: { 
              submissionId: result.submissionId,
              formType: state.responses['la_tua_ricerca_casa_tipo_proprieta']?.la_tua_ricerca_casa_tipo_proprieta || 'simulazione'
            } 
          });
        }
      } else {
        console.error('❌ Errore nell\'invio del form:', result.error);
        toast({
          title: "Errore nell'invio",
          description: result.error || "Si è verificato un errore imprevisto. Riprova.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Errore durante l\'invio:', error);
      toast({
        title: "Errore nell'invio",
        description: "Si è verificato un errore imprevisto. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentBlock || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Nessuna domanda disponibile
          </h1>
          <p className="text-gray-600">
            Sembra che tu abbia completato tutte le domande disponibili.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f1]">
      <div className="container max-w-3xl mx-auto flex-1 flex flex-col p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {currentBlock.title}
          </h1>
          <p className="text-gray-600">
            {currentQuestion.question_text}
          </p>
        </div>

        <QuestionComponent 
          question={currentQuestion}
          blockId={currentBlock.block_id}
        />

        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline"
            onClick={goBack}
            disabled={!canGoBack}
          >
            Indietro
          </Button>
          {currentQuestion.endOfForm ? (
            <Button
              onClick={handleFormSubmit}
              disabled={!canCompleteForm() || isSubmitting}
              isLoading={isSubmitting}
            >
              Completa
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              disabled={!isCurrentQuestionAnswered(currentQuestion.question_id)}
            >
              Avanti
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
