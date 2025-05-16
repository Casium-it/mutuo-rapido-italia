
import React, { useState } from "react";
import { SubflowQuestion, RepeatingGroupEntry } from "@/types/form";
import { QuestionRenderer } from "./QuestionRenderer";
import { RepeatingGroupQuestionProvider } from "./RepeatingGroupQuestionProvider";

interface FormStyleRepeatingGroupWizardProps {
  questions: SubflowQuestion[];
  initialData?: RepeatingGroupEntry;
  onComplete: (data: RepeatingGroupEntry) => void;
  onCancel: () => void;
  completeButtonText?: string;
  cancelButtonText?: string;
}

export function FormStyleRepeatingGroupWizard({
  questions,
  initialData = {},
  onComplete,
  onCancel,
  completeButtonText = "Aggiungi elemento",
  cancelButtonText = "Annulla"
}: FormStyleRepeatingGroupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RepeatingGroupEntry>({
    ...initialData,
    id: initialData.id || undefined
  });
  
  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  
  // Gestisci il passo precedente
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    } else {
      onCancel();
    }
  };
  
  // Gestisci il passo successivo
  const handleNextStep = () => {
    // Vai al prossimo passaggio
    setCurrentStep(prevStep => prevStep + 1);
  };
  
  // Funzione per completare la procedura
  const handleComplete = (data: RepeatingGroupEntry) => {
    // Aggiorna i dati locali con quelli del ultimo step
    const updatedData = {
      ...formData,
      ...data,
      id: formData.id || initialData.id
    };
    
    // Passa i dati completi al genitore
    onComplete(updatedData);
  };
  
  // Funzione per aggiornare i dati quando un passaggio è stato completato
  const handleStepComplete = (data: RepeatingGroupEntry) => {
    // Aggiorna i dati locali con i nuovi dati
    setFormData(prev => ({
      ...prev,
      ...data
    }));
    
    // Se è l'ultimo passaggio, completa il wizard
    if (isLastQuestion) {
      handleComplete({
        ...formData,
        ...data
      });
    }
  };
  
  // Renderizza il testo della domanda con i placeholder sostituiti
  const renderQuestionText = () => {
    const text = currentQuestion.question_text;
    return text;
  };

  return (
    <div className="max-w-xl animate-fade-in">
      <RepeatingGroupQuestionProvider
        question={currentQuestion}
        currentStep={currentStep}
        initialData={formData}
        onComplete={handleStepComplete}
        onCancel={onCancel}
        onNextStep={handleNextStep}
        onPreviousStep={handlePreviousStep}
        isLastQuestion={isLastQuestion}
      >
        <QuestionRenderer
          question={currentQuestion}
          questionText={renderQuestionText()}
          showNavigationButtons={true}
          nextButtonText="Avanti"
          prevButtonText={currentStep === 0 ? cancelButtonText : "Indietro"}
          completeButtonText={initialData.id ? "Salva modifiche" : completeButtonText}
          isLastQuestion={isLastQuestion}
        />
      </RepeatingGroupQuestionProvider>
    </div>
  );
}
