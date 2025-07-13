
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useForm } from "@/contexts/FormContext";
import { createOrUpdateAutoSave } from "@/services/autoSaveService";
import { generateSimulationId } from "@/utils/simulationId";

export function FormSubmitButton() {
  const { state, blocks, formSlug } = useForm();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsNavigating(true);
    console.log("FormSubmitButton: Navigating to FormLoading...");
    console.log("FormSubmitButton: FormSlug from context:", formSlug);
    console.log("FormSubmitButton: Form state data:", {
      responses: Object.keys(state.responses).length,
      activeBlocks: state.activeBlocks,
      completedBlocks: state.completedBlocks,
      dynamicBlocks: state.dynamicBlocks?.length || 0
    });
    
    try {
      // Final auto-save with 100% completion before submission
      const simulationId = generateSimulationId();
      await createOrUpdateAutoSave({
        simulationId,
        formState: {
          ...state,
          answeredQuestions: Array.from(state.answeredQuestions)
        },
        percentage: 100,
        formSlug: formSlug || 'simulazione-mutuo'
      });

      // Navigate to FormLoading with form data (same format as CompleteFormButton)
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
      console.error('Error navigating to FormLoading:', error);
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
