
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@/contexts/FormContext";

export const CompleteFormButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const { state, formSlug } = useForm();

  const handleSubmitForm = async () => {
    // Navigate immediately to loading page with form data
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
    >
      <Check className="mr-2 h-4 w-4" />
      Completa form
    </Button>
  );
};
