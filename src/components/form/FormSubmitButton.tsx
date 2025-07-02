
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useForm } from "@/contexts/FormContext";

export function FormSubmitButton() {
  const { state } = useForm(); // Remove blocks from destructuring
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const handleSubmit = async () => {
    setIsNavigating(true);
    console.log("FormSubmitButton: Navigating to FormLoading...");
    
    try {
      // Navigate to FormLoading with form data (no staticBlocks)
      navigate('/form-loading', { 
        state: { 
          formData: {
            responses: state.responses,
            activeBlocks: state.activeBlocks,
            completedBlocks: state.completedBlocks,
            dynamicBlocks: state.dynamicBlocks,
            answeredQuestions: Array.from(state.answeredQuestions),
            navigationHistory: state.navigationHistory,
            blockActivations: state.blockActivations,
            pendingRemovals: state.pendingRemovals,
            formSlug: params.formSlug // FormLoading will use this to get cache memory blocks
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
