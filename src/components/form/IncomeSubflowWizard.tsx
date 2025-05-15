
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubflowQuestion, RepeatingGroupEntry } from "@/types/form";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface IncomeSubflowWizardProps {
  questions: SubflowQuestion[];
  initialData?: RepeatingGroupEntry;
  onComplete: (data: RepeatingGroupEntry) => void;
  onCancel: () => void;
}

export function IncomeSubflowWizard({
  questions,
  initialData = {},
  onComplete,
  onCancel
}: IncomeSubflowWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RepeatingGroupEntry>({
    ...initialData,
    id: initialData.id || undefined
  });
  
  const currentQuestion = questions[currentStep];
  
  const handleStepComplete = () => {
    // Validazione del campo corrente
    const questionId = currentQuestion.question_id;
    
    if (questionId === 'income_type' && !formData.income_type) {
      toast({
        title: "Campo obbligatorio",
        description: "Seleziona un tipo di reddito per continuare",
        variant: "destructive"
      });
      return;
    }
    
    if (questionId === 'amount_input') {
      const amount = parseFloat(String(formData.amount_input));
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Importo non valido",
          description: "Inserisci un importo valido maggiore di zero",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Vai al passaggio successivo o completa
    if (currentStep < questions.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      onComplete(formData);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    } else {
      onCancel();
    }
  };
  
  const renderQuestionInput = () => {
    const { question_id, question_text, placeholders } = currentQuestion;
    const placeholderKey = Object.keys(placeholders)[0];
    const placeholder = placeholders[placeholderKey];
    
    if (question_id === 'income_type') {
      // Tipo di reddito (select)
      return (
        <div className="space-y-3">
          <Label htmlFor="income_type">{question_text}</Label>
          <Select
            value={formData.income_type}
            onValueChange={(value) => setFormData({ ...formData, income_type: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona tipo di reddito" />
            </SelectTrigger>
            <SelectContent>
              {(placeholder.type === 'select' ? placeholder.options : []).map((option) => (
                <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    
    if (question_id === 'amount_input') {
      // Importo (numero)
      return (
        <div className="space-y-3">
          <Label htmlFor="amount_input">{question_text}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            <Input
              id="amount_input"
              type="number"
              className="pl-7"
              placeholder="0,00"
              value={formData.amount_input || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setFormData({ ...formData, amount_input: isNaN(value) ? '' : value });
              }}
            />
          </div>
        </div>
      );
    }
    
    if (question_id === 'income_description') {
      // Descrizione (testo)
      return (
        <div className="space-y-3">
          <Label htmlFor="income_description">{question_text}</Label>
          <Input
            id="income_description"
            type="text"
            placeholder="Descrivi questa fonte di reddito (opzionale)"
            value={formData.income_description || ''}
            onChange={(e) => setFormData({ ...formData, income_description: e.target.value })}
          />
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-xl font-semibold mb-1">
          {initialData.id ? 'Modifica fonte di reddito' : 'Aggiungi fonte di reddito'}
        </h3>
      </div>
      
      <div className="space-y-4">
        {renderQuestionInput()}
      </div>
      
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviousStep}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? 'Annulla' : 'Indietro'}
        </Button>
        
        <Button
          type="button"
          onClick={handleStepComplete}
        >
          {currentStep < questions.length - 1 ? (
            'Avanti'
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              {initialData.id ? 'Salva modifiche' : 'Aggiungi reddito'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
