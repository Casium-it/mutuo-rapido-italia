
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useForm } from "@/contexts/FormContext";

export function FormSubmitButton() {
  const { state } = useForm();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const handleSubmit = async () => {
    setIsNavigating(true);
    console.log("FormSubmitButton: Attempting to submit form");
    console.log("FormSubmitButton: params:", params);
    console.log("FormSubmitButton: params.formSlug:", params.formSlug);
    console.log("FormSubmitButton: state.formSlug:", state.formSlug);
    console.log("FormSubmitButton: state.responses:", state.responses);
    console.log("FormSubmitButton: Object.keys(state.responses).length:", Object.keys(state.responses || {}).length);
    console.log("FormSubmitButton: state.activeBlocks:", state.activeBlocks);
    console.log("FormSubmitButton: state.completedBlocks:", state.completedBlocks);
    console.log("FormSubmitButton: state.dynamicBlocks:", state.dynamicBlocks);
    
    // Use formSlug from state (preferred) or params as fallback
    const formSlug = state.formSlug || params.formSlug;
    
    try {
      // Navigate to FormLoading with form data
      navigate('/form-loading', { 
        state: { 
          formData: {
            responses: state.responses || {},
            activeBlocks: state.activeBlocks || [],
            completedBlocks: state.completedBlocks || [],
            dynamicBlocks: state.dynamicBlocks || [],
            answeredQuestions: Array.from(state.answeredQuestions || new Set()),
            navigationHistory: state.navigationHistory || [],
            blockActivations: state.blockActivations || {},
            pendingRemovals: state.pendingRemovals || [],
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
