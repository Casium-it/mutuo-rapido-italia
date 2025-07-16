
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useForm } from "@/contexts/FormContext";
import { completedSave } from "@/services/smartSaveService";

/**
 * SECONDARY FORM SUBMISSION PATH
 * 
 * This component is used ONLY for specific placeholder options that need direct form submission.
 * 
 * ⚠️ WARNING: This is NOT the primary submission path!
 * The PRIMARY submission path is in QuestionView.tsx (handleSubmitForm function)
 * which handles forms with endOfForm: true questions.
 * 
 * When making changes to form submission logic, ALWAYS update BOTH:
 * 1. QuestionView.tsx (PRIMARY - most form submissions go through here)
 * 2. FormSubmitButton.tsx (SECONDARY - this file)
 * 
 * Both paths must maintain identical:
 * - formData structure
 * - simulationId handling
 * - navigation logic
 * - error handling
 */
export function FormSubmitButton() {
  const { state, blocks, formSlug } = useForm();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsNavigating(true);
    console.log("FormSubmitButton: Navigating to FormLoading...");
    console.log("FormSubmitButton: Using existing simulationId:", state.simulationId);
    console.log("FormSubmitButton: FormSlug from context:", formSlug);
    console.log("FormSubmitButton: Form state data:", {
      responses: Object.keys(state.responses).length,
      activeBlocks: state.activeBlocks,
      completedBlocks: state.completedBlocks,
      dynamicBlocks: state.dynamicBlocks?.length || 0
    });
    
    try {
      // Final completed form save with 100% completion before submission using existing simulationId
      if (state.simulationId) {
        console.log("FormSubmitButton: Performing 100% completed form save with existing ID...");
        const completeSaveResult = await completedSave(
          state.simulationId,
          state,
          formSlug || 'simulazione-mutuo'
        );

        if (completeSaveResult.success) {
          console.log("✅ FormSubmitButton: 100% completed form save successful");
        } else {
          console.error("❌ FormSubmitButton: Completed form save failed:", completeSaveResult.error);
        }
      } else {
        console.warn("⚠️ FormSubmitButton: No simulationId found, skipping completed form save");
      }

      // Navigate to FormLoading with form data (same format as CompleteFormButton)
      navigate('/form-loading', { 
        state: { 
          formData: {
            responses: state.responses,
            activeBlocks: state.activeBlocks,
            completedBlocks: state.completedBlocks,
            dynamicBlocks: state.dynamicBlocks,
            formSlug: formSlug,
            simulationId: state.simulationId
          }
        } 
      });
    } catch (error) {
      console.error('FormSubmitButton: Error during submission:', error);
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
