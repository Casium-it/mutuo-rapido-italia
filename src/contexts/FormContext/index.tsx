
import { FormProvider, FormContext, FormContextType } from "./FormProvider";
import { useFormState } from "./useFormState";
import { useFormNavigation } from "./useFormNavigation";
import { useFormResponses } from "./useFormResponses";
import { useFormBlocks } from "./useFormBlocks";
import { useFormDynamicBlocks } from "./useFormDynamicBlocks";
import { useContext } from "react";

// Funzione base per utilizzare il contesto del form
export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};

// Esporta tutti i componenti e gli hooks
export {
  FormProvider,
  FormContext,
  useFormState,
  useFormNavigation,
  useFormResponses,
  useFormBlocks,
  useFormDynamicBlocks
};
