
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from '@/contexts/FormContext';
import { handleFormCompletion } from '@/services/formBehaviorService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLinkedForm } from '@/hooks/useLinkedForm';

interface CompleteFormButtonProps {
  className?: string;
}

const CompleteFormButton: React.FC<CompleteFormButtonProps> = ({ 
  className = "" 
}) => {
  const { state, blocks } = useForm();
  const { isLinkedForm } = useLinkedForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Ottieni il token linkato se presente
      const linkedToken = isLinkedForm ? searchParams.get('token') : undefined;
      
      // Determina il comportamento di completamento
      // Per i form linkati, usa sempre form-completed-redirect
      const completionBehavior = linkedToken ? 'form-completed-redirect' : 'form-completed';
      
      console.log('Completing form with:', {
        completionBehavior,
        linkedToken: linkedToken || 'none',
        isLinkedForm
      });

      const result = await handleFormCompletion(
        state,
        blocks,
        completionBehavior,
        linkedToken || undefined
      );

      if (result.success && result.shouldRedirect && result.redirectUrl) {
        console.log('Redirecting to:', result.redirectUrl);
        navigate(result.redirectUrl);
      } else if (!result.success) {
        toast({
          title: "Errore",
          description: result.error || "Si è verificato un errore durante l'invio del form",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Form completion error:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleComplete}
      disabled={isSubmitting}
      className={`w-full bg-[#245C4F] hover:bg-[#1e4f44] text-white font-medium py-3 px-6 rounded-lg shadow-[0_3px_0_0_#1a453e] hover:shadow-[0_3px_4px_rgba(26,69,62,0.25)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none ${className}`}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Invio in corso...
        </>
      ) : (
        <>
          {isLinkedForm ? 'Completa simulazione' : 'Completa form'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
};

export default CompleteFormButton;
