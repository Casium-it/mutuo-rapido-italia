
import React, { useEffect, useState } from 'react';
import { useForm } from '@/contexts/FormContext';
import { FormQuestion } from './FormQuestion';
import { Question, RepeatingGroupEntry } from '@/types/form';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SubflowFormProps {
  questions: Question[];
  initialData?: RepeatingGroupEntry;
  onComplete: (data: RepeatingGroupEntry) => void;
  onCancel: () => void;
  endSignal?: string;
}

export function SubflowForm({ 
  questions, 
  initialData = {}, 
  onComplete, 
  onCancel,
  endSignal = "end_of_subflow" 
}: SubflowFormProps) {
  // Stato locale per il form
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<RepeatingGroupEntry>(initialData);
  
  // Ottenere la domanda corrente
  const currentQuestion = questions[currentQuestionIndex];
  
  // Gestione dell'avanzamento
  const handleNext = (questionId: string, value: any) => {
    // Salva la risposta
    setResponses(prev => ({ 
      ...prev, 
      [questionId]: value 
    }));
    
    // Cerca la leads_to associata a questo valore
    let leadsTo = "";
    const question = questions.find(q => q.question_id === questionId);
    
    if (question) {
      // Trova il placeholder usato per l'input
      const priorityPlaceholder = question.leads_to_placeholder_priority;
      const placeholder = question.placeholders[priorityPlaceholder];
      
      if (placeholder.type === 'select') {
        // Per i select, trova l'opzione selezionata
        const selectedOption = placeholder.options.find(opt => opt.id === value);
        if (selectedOption) {
          leadsTo = selectedOption.leads_to;
        }
      } else if ('leads_to' in placeholder) {
        // Per gli input, usa direttamente leads_to
        leadsTo = placeholder.leads_to || "";
      }
    }
    
    // Controlla se è il segnale di fine
    if (leadsTo === endSignal) {
      // Finito il subflow, ritorna i dati
      onComplete(responses);
      return;
    }
    
    // Altrimenti vai alla prossima domanda
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Gestione del ritorno alla domanda precedente
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Se siamo alla prima domanda, annulla l'intero subflow
      onCancel();
    }
  };
  
  // Se non ci sono domande, mostra un messaggio
  if (!questions.length) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">Nessuna domanda da mostrare.</p>
        <Button onClick={onCancel} className="mt-4">Torna indietro</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Mostra la domanda corrente */}
      <FormQuestion
        question={currentQuestion}
        initialValue={responses[currentQuestion.question_id]}
        onAnswer={handleNext}
        inline={currentQuestion.inline}
      />
      
      {/* Pulsanti di navigazione */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Indietro
        </Button>
        
        {currentQuestionIndex < questions.length - 1 && (
          <Button
            variant="default"
            onClick={() => {
              // Prova ad avanzare automaticamente se c'è già una risposta
              const value = responses[currentQuestion.question_id];
              if (value !== undefined) {
                handleNext(currentQuestion.question_id, value);
              }
            }}
            className="flex items-center"
            disabled={!responses[currentQuestion.question_id]}
          >
            Avanti
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
