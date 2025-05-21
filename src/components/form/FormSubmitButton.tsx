
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useForm } from "@/contexts/FormContext";
import { submitFormResponses } from "@/services/formSubmissionService";
import { toast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";

export function FormSubmitButton() {
  const { state } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  
  // Ottieni il tipo di form dai parametri dell'URL
  const formType = params.blockType || "simulazione";

  // Estrai l'identificatore dell'utente dall'URL se presente
  const searchParams = new URLSearchParams(window.location.search);
  const userIdentifier = searchParams.get('ref') || undefined;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await submitFormResponses(
        state.responses, 
        formType,
        userIdentifier
      );
      
      if (result.success) {
        // Naviga alla pagina di completamento con i dati della submission
        navigate('/form-completed', { 
          state: { 
            submissionData: {
              id: result.submissionId,
              formType,
              date: new Date().toISOString()
            } 
          } 
        });
      } else {
        toast({
          title: "Errore",
          description: result.error || "Si è verificato un errore nell'invio del form. Riprova più tardi.",
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Errore durante l\'invio del form:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto. Riprova più tardi.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Button 
      onClick={handleSubmit}
      disabled={isSubmitting}
      className="w-full md:w-auto bg-[#245C4F] hover:bg-[#1a453b] text-white py-3 px-6 text-lg font-medium rounded-md"
    >
      {isSubmitting ? 'Invio in corso...' : 'Invia richiesta'}
    </Button>
  );
}
