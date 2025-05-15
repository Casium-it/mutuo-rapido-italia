
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
  const handleAnswer = (questionId: string, value: any) => {
    // Salva la risposta
    setResponses(prev => ({ 
      ...prev, 
      [questionId]: value 
    }));
    
    // Controlla se c'è un _leads_to nel valore (passato da FormQuestion)
    if (value._leads_to) {
      const leadsTo = value._leads_to;
      
      // Rimuovi il campo _leads_to prima di salvare la risposta
      delete value._leads_to;
      
      // Controlla se è il segnale di fine
      if (leadsTo === endSignal) {
        // Finito il subflow, ritorna i dati
        onComplete(responses);
        return;
      }
      
      // Trova l'indice della domanda successiva
      const nextIndex = questions.findIndex(q => q.question_id === leadsTo);
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
        return;
      }
      
      // Se non trovata, vai alla domanda successiva
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Se siamo all'ultima domanda, considera completato il subflow
        onComplete(responses);
      }
    } else {
      // Comportamento predefinito: vai alla domanda successiva
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Se siamo all'ultima domanda, considera completato il subflow
        onComplete(responses);
      }
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
  
  // Calcola initialValue per FormQuestion
  const getQuestionInitialValue = (questionId: string) => {
    // Se la risposta è già presente nello stato, restituiscila
    if (responses[questionId]) {
      return { [questionId]: responses[questionId] };
    }
    // Altrimenti, restituisci undefined
    return undefined;
  };
  
  return (
    <div className="space-y-6">
      {/* Mostra la domanda corrente */}
      <FormQuestion
        question={currentQuestion}
        initialValue={getQuestionInitialValue(currentQuestion.question_id)}
        onAnswer={handleAnswer}
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
                handleAnswer(currentQuestion.question_id, value);
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
