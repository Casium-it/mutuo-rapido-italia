
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@/contexts/FormContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CompleteFormButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const { state, blocks } = useForm();
  const { toast } = useToast();

  const handleSubmitForm = async () => {
    try {
      // Retrieve the URL params for referral ID if present
      const searchParams = new URLSearchParams(window.location.search);
      const referralId = searchParams.get('ref');
      
      // Submit form data to Supabase
      const { data: submission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          user_identifier: referralId || null,
          form_type: 'mutuo',
          metadata: { blocks: state.activeBlocks }
        })
        .select('id')
        .single();

      if (submissionError) throw submissionError;
      
      // Prepare response data
      const responsesData = [];
      
      for (const questionId in state.responses) {
        const question = blocks
          .flatMap(block => block.questions)
          .find(q => q.question_id === questionId);
        
        if (question) {
          const blockId = blocks.find(
            block => block.questions.some(q => q.question_id === questionId)
          )?.block_id || '';
          
          const responseData = state.responses[questionId];
          
          for (const placeholderKey in responseData) {
            responsesData.push({
              submission_id: submission.id,
              question_id: questionId,
              question_text: question.question_text,
              block_id: blockId,
              response_value: { 
                placeholderKey, 
                value: responseData[placeholderKey] 
              }
            });
          }
        }
      }
      
      // Insert all response data
      if (responsesData.length > 0) {
        const { error: responsesError } = await supabase
          .from('form_responses')
          .insert(responsesData);
        
        if (responsesError) throw responsesError;
      }
      
      // Navigate to completion page
      toast({
        title: "Modulo inviato con successo!",
        description: "Grazie per aver completato il questionario."
      });
      
      navigate('/form-completed');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Errore durante l'invio",
        description: "Si è verificato un errore durante l'invio del modulo. Riprova più tardi."
      });
    }
  };

  // Check if all active blocks are completed
  const areAllBlocksCompleted = state.activeBlocks?.every(
    blockId => state.completedBlocks?.includes(blockId)
  );

  if (!areAllBlocksCompleted) {
    return null;
  }

  return (
    <Button 
      onClick={handleSubmitForm}
      className={`w-full bg-[#245C4F] hover:bg-[#1b4a3e] text-white ${className}`}
    >
      <Check className="mr-2 h-4 w-4" />
      Completa form
    </Button>
  );
};
