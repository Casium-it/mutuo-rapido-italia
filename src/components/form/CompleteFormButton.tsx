
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "@/contexts/FormContext";

export const CompleteFormButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const params = useParams();
  const { state } = useForm();

  const handleSubmitForm = async () => {
    // Extract formSlug with fallback methods
    const formSlug = state.formSlug || params.formSlug;
    
    if (!formSlug) {
      console.error("CompleteFormButton: No formSlug available");
      return;
    }

    // Create formData object
    const formData = {
      responses: state.responses || {},
      activeBlocks: state.activeBlocks || [],
      completedBlocks: state.completedBlocks || [],
      dynamicBlocks: state.dynamicBlocks || [],
      answeredQuestions: Array.from(state.answeredQuestions || new Set()),
      navigationHistory: state.navigationHistory || [],
      blockActivations: state.blockActivations || {},
      pendingRemovals: state.pendingRemovals || [],
      formSlug: formSlug
    };

    // Navigate to loading page with form data
    navigate('/form-loading', { 
      state: { 
        formData: formData
      }
    });
  };

  // Check if form can be submitted
  const formSlug = state.formSlug || params.formSlug;
  const canSubmit = formSlug && (
    (state.activeBlocks?.length > 0 && state.activeBlocks?.every(
      blockId => state.completedBlocks?.includes(blockId)
    )) ||
    (state.responses && Object.keys(state.responses).length > 0) ||
    true
  );

  if (!canSubmit) {
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
