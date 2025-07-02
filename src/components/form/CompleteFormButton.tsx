
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm } from "@/contexts/FormContext";

export const CompleteFormButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { state } = useForm();

  const handleSubmitForm = async () => {
    // STRATEGIC LOGGING: Track current route and state before submission
    console.log("=== COMPLETE FORM BUTTON SUBMISSION START ===");
    console.log("CompleteFormButton: Current location:", {
      pathname: location.pathname,
      search: location.search,
      state: location.state
    });
    console.log("CompleteFormButton: Current URL:", window.location.href);
    console.log("CompleteFormButton: Params object:", params);
    console.log("CompleteFormButton: params.formSlug:", params.formSlug);
    console.log("CompleteFormButton: state.formSlug:", state.formSlug);
    console.log("CompleteFormButton: Form responses count:", Object.keys(state.responses || {}).length);
    console.log("CompleteFormButton: Active blocks:", state.activeBlocks);
    console.log("CompleteFormButton: Completed blocks:", state.completedBlocks);

    // Extract formSlug with multiple fallback methods
    const formSlug = state.formSlug || params.formSlug;
    console.log("CompleteFormButton: Final formSlug resolved to:", formSlug);
    
    if (!formSlug) {
      console.error("CompleteFormButton: CRITICAL - No formSlug available from any source");
      console.error("CompleteFormButton: Available state keys:", Object.keys(state));
      console.error("CompleteFormButton: Available params keys:", Object.keys(params));
      
      // Try to extract from URL as last resort
      const urlMatch = window.location.pathname.match(/\/form\/([^/]+)/);
      const urlFormSlug = urlMatch ? urlMatch[1] : null;
      console.log("CompleteFormButton: URL extraction attempt:", urlFormSlug);
      
      if (!urlFormSlug) {
        console.error("CompleteFormButton: Failed to extract formSlug from URL, cannot proceed");
        return;
      }
    }

    // Create formData object with extensive logging
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

    console.log("CompleteFormButton: FormData object created:", {
      responsesCount: Object.keys(formData.responses).length,
      activeBlocksCount: formData.activeBlocks.length,
      completedBlocksCount: formData.completedBlocks.length,
      dynamicBlocksCount: formData.dynamicBlocks.length,
      formSlug: formData.formSlug,
      hasFormSlug: !!formData.formSlug
    });
    
    console.log("CompleteFormButton: FormData.formSlug explicitly:", formData.formSlug);
    console.log("CompleteFormButton: JSON.stringify test of formData:", JSON.stringify({
      formSlug: formData.formSlug,
      responsesCount: Object.keys(formData.responses).length
    }));

    console.log("CompleteFormButton: About to navigate to /form-loading");
    console.log("CompleteFormButton: Navigation state will be:", { formData });
    console.log("=== COMPLETE FORM BUTTON SUBMISSION END ===");

    // Navigate to loading page with form data
    navigate('/form-loading', { 
      state: { 
        formData: formData
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
