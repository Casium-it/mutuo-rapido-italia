
import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useForm } from "@/contexts/FormContext";

export function FormSubmitButton() {
  const { state } = useForm();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleSubmit = async () => {
    setIsNavigating(true);
    
    // STRATEGIC LOGGING: Track current route and state before submission
    console.log("=== FORM SUBMIT BUTTON SUBMISSION START ===");
    console.log("FormSubmitButton: Current location:", {
      pathname: location.pathname,
      search: location.search,
      state: location.state
    });
    console.log("FormSubmitButton: Current URL:", window.location.href);
    console.log("FormSubmitButton: Params object:", params);
    console.log("FormSubmitButton: params.formSlug:", params.formSlug);
    console.log("FormSubmitButton: state.formSlug:", state.formSlug);
    console.log("FormSubmitButton: Form responses count:", Object.keys(state.responses || {}).length);
    console.log("FormSubmitButton: Active blocks:", state.activeBlocks);
    console.log("FormSubmitButton: Completed blocks:", state.completedBlocks);
    
    // Use formSlug from state (preferred) or params as fallback
    const formSlug = state.formSlug || params.formSlug;
    console.log("FormSubmitButton: Final formSlug resolved to:", formSlug);
    
    if (!formSlug) {
      console.error("FormSubmitButton: CRITICAL - No formSlug available from any source");
      console.error("FormSubmitButton: Available state keys:", Object.keys(state));
      console.error("FormSubmitButton: Available params keys:", Object.keys(params));
      
      // Try to extract from URL as last resort
      const urlMatch = window.location.pathname.match(/\/form\/([^/]+)/);
      const urlFormSlug = urlMatch ? urlMatch[1] : null;
      console.log("FormSubmitButton: URL extraction attempt:", urlFormSlug);
      
      if (!urlFormSlug) {
        console.error("FormSubmitButton: Failed to extract formSlug from URL, cannot proceed");
        setIsNavigating(false);
        return;
      }
    }
    
    try {
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

      console.log("FormSubmitButton: FormData object created:", {
        responsesCount: Object.keys(formData.responses).length,
        activeBlocksCount: formData.activeBlocks.length,
        completedBlocksCount: formData.completedBlocks.length,
        dynamicBlocksCount: formData.dynamicBlocks.length,
        formSlug: formData.formSlug,
        hasFormSlug: !!formData.formSlug
      });
      
      console.log("FormSubmitButton: FormData.formSlug explicitly:", formData.formSlug);
      console.log("FormSubmitButton: JSON.stringify test of formData:", JSON.stringify({
        formSlug: formData.formSlug,
        responsesCount: Object.keys(formData.responses).length
      }));

      console.log("FormSubmitButton: About to navigate to /form-loading");
      console.log("FormSubmitButton: Navigation state will be:", { formData });
      console.log("=== FORM SUBMIT BUTTON SUBMISSION END ===");
      
      // Navigate to FormLoading with form data
      navigate('/form-loading', { 
        state: { 
          formData: formData
        } 
      });
    } catch (error) {
      console.error('FormSubmitButton: Error navigating to FormLoading:', error);
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
