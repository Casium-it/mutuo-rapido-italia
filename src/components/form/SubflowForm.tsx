
import React, { useEffect, useState } from 'react';
import { FormQuestion } from './FormQuestion';
import { Question, RepeatingGroupEntry } from '@/types/form';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SelectPlaceholderBox } from './SelectPlaceholderBox';

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
  
  // Otteniamo la domanda corrente
  const currentQuestion = questions[currentQuestionIndex];
  
  // Effetto per inizializzare i dati se ci sono dati iniziali
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setResponses({...initialData});
    }
  }, [initialData]);
  
  // Funzione per gestire la risposta a una domanda
  const handleAnswer = (questionId: string, value: any) => {
    // Salva la risposta localmente
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Funzione per navigare alla domanda successiva
  const handleNext = () => {
    const question = currentQuestion;
    const questionId = question.question_id;
    const value = responses[questionId];
    
    if (!value) {
      // Non procedere se non c'è un valore
      return;
    }
    
    // Determina il prossimo passo in base alla priorità del placeholder
    let nextDestination: string | undefined;
    
    // Se è specificata una priorità per il placeholder, usa quella
    if (question.leads_to_placeholder_priority) {
      const priorityPlaceholder = question.leads_to_placeholder_priority;
      const placeholder = question.placeholders[priorityPlaceholder];
      
      if (placeholder.type === "select") {
        // Per i select, trova l'opzione selezionata
        const selectedOption = placeholder.options.find(opt => opt.id === value[priorityPlaceholder]);
        if (selectedOption) {
          nextDestination = selectedOption.leads_to;
        }
      } else if (placeholder.type === "input") {
        // Per gli input, usa leads_to del placeholder direttamente
        nextDestination = placeholder.leads_to;
      }
    } else {
      // Se non c'è priorità specificata, cerca il primo placeholder con leads_to
      for (const [key, placeholder] of Object.entries(question.placeholders)) {
        if (placeholder.type === "select") {
          const selectedOption = placeholder.options.find(opt => opt.id === value[key]);
          if (selectedOption) {
            nextDestination = selectedOption.leads_to;
            break;
          }
        } else if (placeholder.type === "input" && placeholder.leads_to) {
          nextDestination = placeholder.leads_to;
          break;
        }
      }
    }
    
    // Verifica se abbiamo raggiunto il segnale di fine
    if (nextDestination === endSignal) {
      onComplete(responses);
      return;
    }
    
    // Altrimenti, vai alla prossima domanda
    if (nextDestination) {
      // Cerca l'indice della domanda con l'ID corrispondente
      const nextIndex = questions.findIndex(q => q.question_id === nextDestination);
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
        return;
      }
    }
    
    // Se non c'è un destination specifico o non è stato trovato, passa alla domanda successiva
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Se siamo all'ultima domanda, completa il subflow
      onComplete(responses);
    }
  };
  
  // Funzione per tornare alla domanda precedente
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
  
  // Renderizza il testo della domanda, sostituendo i placeholder con i componenti appropriati
  const renderQuestionText = () => {
    const questionText = currentQuestion.question_text;
    const parts = [];
    let lastIndex = 0;
    const regex = /\{\{([^}]+)\}\}/g;
    let match;
    
    while ((match = regex.exec(questionText)) !== null) {
      // Aggiungi testo prima del placeholder
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{questionText.slice(lastIndex, match.index)}</span>);
      }
      
      const placeholderKey = match[1];
      const placeholder = currentQuestion.placeholders[placeholderKey];
      
      if (placeholder && placeholder.type === "select") {
        // Renderizza un SelectPlaceholderBox per i placeholder di tipo select
        parts.push(
          <SelectPlaceholderBox
            key={`placeholder-${placeholderKey}`}
            questionId={currentQuestion.question_id}
            placeholderKey={placeholderKey}
            options={placeholder.options}
            value={responses[currentQuestion.question_id]?.[placeholderKey]}
          />
        );
      } else {
        // Renderizza un span semplice per gli altri tipi di placeholder
        parts.push(
          <span 
            key={`placeholder-${placeholderKey}`}
            className="inline-block bg-gray-100 px-2 py-1 rounded mx-1"
          >
            {responses[currentQuestion.question_id]?.[placeholderKey] || '___'}
          </span>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Aggiungi il testo rimanente
    if (lastIndex < questionText.length) {
      parts.push(<span key={`text-${lastIndex}`}>{questionText.slice(lastIndex)}</span>);
    }
    
    return <div className="text-xl font-medium mb-6">{parts}</div>;
  };
  
  // Determina il valore iniziale per la domanda corrente
  const getInitialValue = () => {
    const questionId = currentQuestion.question_id;
    return responses[questionId] ? { [questionId]: responses[questionId] } : undefined;
  };
  
  return (
    <div className="space-y-6">
      {/* Mostra la domanda corrente con supporto per inline */}
      <FormQuestion
        question={currentQuestion}
        initialValue={getInitialValue()}
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
        
        <Button
          variant="default"
          onClick={handleNext}
          className="flex items-center"
          disabled={!responses[currentQuestion.question_id]}
        >
          Avanti
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
