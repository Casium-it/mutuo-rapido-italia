
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useForm } from "@/contexts/FormContext";

export function FormSubmitButton() {
  const { state, blocks } = useForm();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsNavigating(true);
    console.log("FormSubmitButton: Navigating to FormLoading...");
    
    try {
      // Navigate to FormLoading with form data (same format as CompleteFormButton)
      navigate('/form-loading', { 
        state: { 
          formData: {
            responses: state.responses,
            activeBlocks: state.activeBlocks,
            completedBlocks: state.completedBlocks,
            dynamicBlocks: state.dynamicBlocks
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
