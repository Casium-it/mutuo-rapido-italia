
import { useFormBlocks } from "./useFormBlocks";
import { useFormNavigation } from "./useFormNavigation";
import { useFormResponses } from "./useFormResponses";
import { useForm } from "@/contexts/FormContext";

/**
 * Hook combinato che fornisce tutte le funzionalità estese del form
 */
export const useFormExtended = () => {
  const formContext = useForm();
  const formNavigation = useFormNavigation();
  const formBlocks = useFormBlocks();
  const formResponses = useFormResponses();

  return {
    // Context form base
    ...formContext,
    
    // Navigation related functions
    ...formNavigation,
    
    // Block related functions
    ...formBlocks,
    
    // Response related functions
    ...formResponses,
  };
};
