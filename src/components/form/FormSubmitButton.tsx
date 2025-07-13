
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useForm } from "@/contexts/FormContext";
import { completeFormSave } from "@/services/autoSaveService";

export function FormSubmitButton() {
  const { state, blocks, formSlug } = useForm();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (): Promise<void> => {
    setIsNavigating(true);
    
    try {
      // Perform final save if we have a simulation ID - this is completion save
      if (state.simulationId) {
        console.log('🎯 FORM-SUBMIT: Performing final completion save before submission...');
        await completeFormSave({
          simulationId: state.simulationId,
          formState: {
            ...state,
            answeredQuestions: Array.from(state.answeredQuestions)
          },
          percentage: 100,
          formSlug: formSlug || 'simulazione-mutuo'
        });
      }

      // Navigate to loading page with form data
      navigate('/form-loading', { 
        state: { 
          formData: {
            responses: state.responses,
            activeBlocks: state.activeBlocks,
            completedBlocks: state.completedBlocks,
            dynamicBlocks: state.dynamicBlocks,
            formSlug: formSlug
          }
        } 
      });
      
    } catch (error) {
      console.error('❌ FORM-SUBMIT: Error in form submission:', error);
      setIsNavigating(false);
    }
  };

  return (
    <Button 
      onClick={handleSubmit}
      disabled={isNavigating}
      className="w-full md:w-auto bg-[#245C4F] hover:bg-[#1a453b] text-white py-3 px-6 text-lg font-medium rounded-md"
    >
      {isNavigating ? 'Preparazione...' : 'Invia richiesta'}
    </Button>
  );
}
