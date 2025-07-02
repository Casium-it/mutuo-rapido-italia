
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
    // Enhanced debugging for form submission
    console.log("CompleteFormButton: Attempting to submit form");
    console.log("CompleteFormButton: params:", params);
    console.log("CompleteFormButton: params.formSlug:", params.formSlug);
    console.log("CompleteFormButton: state.formSlug:", state.formSlug);
    console.log("CompleteFormButton: state.responses:", state.responses);
    console.log("CompleteFormButton: Object.keys(state.responses).length:", Object.keys(state.responses || {}).length);
    console.log("CompleteFormButton: state.activeBlocks:", state.activeBlocks);
    console.log("CompleteFormButton: state.completedBlocks:", state.completedBlocks);
    console.log("CompleteFormButton: state.dynamicBlocks:", state.dynamicBlocks);

    // Use formSlug from state (preferred) or params as fallback
    const formSlug = state.formSlug || params.formSlug;
    
    if (!formSlug) {
      console.error("CompleteFormButton: No formSlug available in state or params");
      return;
    }

    // Navigate immediately to loading page with form data
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
  };

  // More lenient check - allow submission if we have a formSlug
  const formSlug = state.formSlug || params.formSlug;
  const canSubmit = formSlug && (
    // Either we have completed blocks
    (state.activeBlocks?.length > 0 && state.activeBlocks?.every(
      blockId => state.completedBlocks?.includes(blockId)
    )) ||
    // Or we have at least some responses
    (state.responses && Object.keys(state.responses).length > 0) ||
    // Or we allow empty form submission for database-driven forms
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
