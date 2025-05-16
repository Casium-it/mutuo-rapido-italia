
import { createContext, useContext, ReactNode } from "react";
import { ValidationTypes } from "@/types/form";

export interface QuestionContextValue {
  responses: Record<string, any>;
  validationErrors: Record<string, boolean>;
  visibleOptions: Record<string, boolean>;
  handleValueChange: (key: string, value: string | string[]) => void;
  handlePlaceholderClick: (key: string) => void;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  isCurrentStepValid: () => boolean;
  isNavigating: boolean;
  getValidationErrorMessage: (validationType: ValidationTypes) => string;
}

const QuestionContext = createContext<QuestionContextValue | undefined>(undefined);

export const useQuestionContext = (): QuestionContextValue => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error("useQuestionContext deve essere usato all'interno di un QuestionProvider");
  }
  return context;
};

export const QuestionProvider = QuestionContext.Provider;

export default QuestionContext;
