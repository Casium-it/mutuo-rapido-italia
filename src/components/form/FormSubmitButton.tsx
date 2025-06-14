
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useForm } from "@/contexts/FormContext";
import { submitFormToSupabase } from "@/services/formSubmissionService";
import { toast } from "@/hooks/use-toast";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { trackSimulationCompleted } from "@/utils/analytics";

export function FormSubmitButton() {
  const { state, blocks } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Get time tracking for completion event
  const { getTimeSpent } = useTimeTracking({
    pageName: 'simulation_form'
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log("Avvio invio form dal FormSubmitButton...");
    
    try {
      // Usa il servizio centralizzato
      const result = await submitFormToSupabase(state, blocks);
      
      if (result.success && result.submissionId) {
        console.log("Form inviato con successo, ID:", result.submissionId);
        
        // Track successful completion with total time spent
        const totalTimeSpent = getTimeSpent();
        trackSimulationCompleted(totalTimeSpent);
        
        // Naviga alla pagina di completamento con i dati della submission
        navigate('/form-completed', { 
          state: { 
            submissionData: {
              id: result.submissionId,
              submissionId: result.submissionId, // Include both for compatibility
              formType: window.location.pathname.includes("mutuo") ? "mutuo" : "simulazione",
              date: new Date().toISOString()
            } 
          } 
        });
      } else {
        console.error("Errore nell'invio:", result.error);
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
