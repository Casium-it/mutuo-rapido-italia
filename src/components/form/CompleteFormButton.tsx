
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@/contexts/FormContext";
import { useToast } from "@/hooks/use-toast";
import { submitFormToSupabase } from "@/services/formSubmissionService";

export const CompleteFormButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const { state, blocks } = useForm();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitForm = async () => {
    try {
      setIsSubmitting(true);
      console.log("Avvio invio form dal CompleteFormButton...");
      
      // Usa il servizio centralizzato
      const result = await submitFormToSupabase(state, blocks);
      
      if (result.success) {
        console.log("Form inviato con successo, ID:", result.submissionId);
        
        // Naviga alla pagina di caricamento con i dati del form
        navigate('/form-loading', { 
          state: { 
            formData: {
              responses: state.responses,
              activeBlocks: state.activeBlocks,
              submissionId: result.submissionId
            }
          }
        });
      } else {
        console.error("Errore nell'invio:", result.error);
        toast({
          variant: "destructive",
          title: "Errore durante l'invio",
          description: result.error || "Si è verificato un errore durante l'invio del modulo. Riprova più tardi."
        });
        setIsSubmitting(false);
      }
      
    } catch (error) {
      console.error('Errore imprevisto durante l\'invio del form:', error);
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: "Errore durante l'invio",
        description: "Si è verificato un errore imprevisto. Riprova più tardi."
      });
    }
  };

  // Controlla se tutti i blocchi attivi sono completati
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
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
          Invio in corso...
        </>
      ) : (
        <>
          <Check className="mr-2 h-4 w-4" />
          Completa form
        </>
      )}
    </Button>
  );
};
