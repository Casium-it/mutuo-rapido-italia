
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubflowQuestion, RepeatingGroupEntry } from "@/types/form";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

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
          <Label htmlFor="income_type" className="text-[16px] font-normal text-gray-900 block">{question_text}</Label>
          <Select
            value={formData.income_type}
            onValueChange={(value) => setFormData({ ...formData, income_type: value })}
          >
            <SelectTrigger className="w-full border-[#BEB8AE] focus:border-[#245C4F] focus-visible:ring-0">
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
          <Label htmlFor="amount_input" className="text-[16px] font-normal text-gray-900 block">{question_text}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
            <Input
              id="amount_input"
              type="number"
              className="pl-7 border-[#BEB8AE] focus:border-[#245C4F] focus-visible:ring-0"
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
          <Label htmlFor="income_description" className="text-[16px] font-normal text-gray-900 block">{question_text}</Label>
          <Input
            id="income_description"
            type="text"
            className="border-[#BEB8AE] focus:border-[#245C4F] focus-visible:ring-0"
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
    <div className="max-w-xl animate-fade-in">
      <div className="mb-5">
        <h2 className="text-[22px] font-semibold text-gray-900 mb-2">
          {currentQuestion.question_text}
        </h2>
        <Separator className="h-[1px] bg-[#F0EAE0] my-5" />
      </div>
      
      <div className="space-y-6 mb-8">
        {renderQuestionInput()}
      </div>
      
      <div className="flex justify-between pt-4 mt-8">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-[18px] py-[12px] rounded-[10px] text-[16px] font-medium inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? 'Annulla' : 'Indietro'}
        </button>
        
        {currentStep < questions.length - 1 ? (
          <button
            type="button"
            onClick={handleStepComplete}
            className="form-next-button"
          >
            Avanti
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStepComplete}
            className="form-next-button"
          >
            <Check className="h-4 w-4" />
            {initialData.id ? 'Salva modifiche' : 'Aggiungi reddito'}
          </button>
        )}
      </div>
    </div>
  );
}
