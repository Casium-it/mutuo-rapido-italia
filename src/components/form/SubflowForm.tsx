
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Question, RepeatingGroupEntry } from '@/types/form';
import { FormContext, useForm } from '@/contexts/FormContext';
import { QuestionView } from './QuestionView';

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
  // Stato per tenere traccia dei dati del form
  const [initialized, setInitialized] = useState(false);
  
  // Crea un blocco sintetico contenente tutte le domande del subflow
  const syntheticBlock = useMemo(() => {
    return {
      block_id: "subflow_synthetic_block",
      block_number: "S1",
      title: "Subflow",
      priority: 0,
      default_active: true,
      require_next_click: true,
      questions: questions.map(q => ({
        ...q,
        block_id: "subflow_synthetic_block"
      }))
    };
  }, [questions]);

  // Inizializza lo stato del form
  const initialFormState = useMemo(() => {
    // Determina la prima domanda attiva
    const firstQuestionId = questions[0]?.question_id || "";
    
    // Converte i dati iniziali nel formato del FormContext
    const initialFormResponses: Record<string, Record<string, any>> = {};
    
    // Inizializza le risposte con i dati iniziali
    Object.entries(initialData).forEach(([key, value]) => {
      // Trova la domanda corrispondente
      const question = questions.find(q => {
        return Object.keys(q.placeholders).some(placeholderKey => placeholderKey === key);
      });
      
      if (question) {
        const questionId = question.question_id;
        if (!initialFormResponses[questionId]) {
          initialFormResponses[questionId] = {};
        }
        
        // Imposta il valore per il placeholder corretto
        Object.keys(question.placeholders).forEach(placeholderKey => {
          if (placeholderKey === key) {
            initialFormResponses[questionId][placeholderKey] = value;
          }
        });
      }
    });
    
    return {
      activeBlocks: ["subflow_synthetic_block"],
      activeQuestion: {
        block_id: "subflow_synthetic_block",
        question_id: firstQuestionId
      },
      responses: initialFormResponses,
      answeredQuestions: new Set<string>(), // Specifichiamo esplicitamente il tipo Set<string>
      navigationHistory: [],
    };
  }, [initialData, questions]);
  
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Funzione per normalizzare i dati prima di completare il subflow
  const normalizeData = (formResponses: Record<string, Record<string, any>>): RepeatingGroupEntry => {
    const normalizedData: RepeatingGroupEntry = { ...initialData };
    
    // Estrai i valori primitivi dalle risposte del form
    Object.entries(formResponses).forEach(([questionId, placeholders]) => {
      // Trova la domanda corrispondente per accedere ai placeholders
      const question = questions.find(q => q.question_id === questionId);
      
      if (question) {
        Object.entries(placeholders).forEach(([placeholderKey, value]) => {
          // Gestisce i diversi tipi di campo
          if (placeholderKey === 'amount_input') {
            // Assicurati che l'importo sia salvato come numero
            normalizedData[placeholderKey] = typeof value === 'string' 
              ? parseFloat(value) 
              : (typeof value === 'number' ? value : 0);
          }
          else if (typeof value === 'object' && value !== null) {
            // Per gli oggetti complessi, salva solo l'id o un valore primitivo
            if ('id' in value) {
              normalizedData[placeholderKey] = value.id;
            } else {
              const firstPrimitive = Object.values(value).find(v => 
                typeof v !== 'object' || v === null
              );
              normalizedData[placeholderKey] = firstPrimitive !== undefined ? firstPrimitive : String(value);
            }
          }
          else {
            // Utilizza il valore così com'è per tipi primitivi
            normalizedData[placeholderKey] = value;
          }
        });
      }
    });
    
    return normalizedData;
  };
  
  // Handler per la navigazione nel FormContext isolato
  const handleNavigation = (
    fromBlockId: string, 
    fromQuestionId: string, 
    toBlockId: string, 
    toQuestionId: string,
    formResponses: Record<string, Record<string, any>>
  ) => {
    // Controlla se siamo arrivati al segnale di fine
    if (toQuestionId === endSignal) {
      // Normalizza i dati prima di completare
      const normalizedData = normalizeData(formResponses);
      onComplete(normalizedData);
    }
  };
  
  // Handler per il tasto indietro che porta all'annullamento del subflow
  const handleBack = (
    fromBlockId: string, 
    fromQuestionId: string
  ) => {
    // Se siamo alla prima domanda e si preme indietro, annulla il subflow
    const isFirstQuestion = questions[0]?.question_id === fromQuestionId;
    if (isFirstQuestion) {
      onCancel();
      return true; // Indica che abbiamo gestito l'evento
    }
    return false; // Lascia che il FormContext gestisca la navigazione normale
  };

  // Se non siamo stati ancora inizializzati, mostra un loader
  if (!initialized) {
    return <div className="p-4 text-center">Caricamento...</div>;
  }

  // Crea un handler per sottoscriversi agli eventi di navigazione
  const subscribeToNavigation = useCallback((callback: any) => {
    // Implementa la logica per intercettare eventi di navigazione
    // e chiamare il callback con i dati di navigazione appropriati
    const unsubscribe = () => {
      // Implementazione della funzione di pulizia
    };
    return unsubscribe;
  }, []);

  return (
    <FormContext.Provider 
      value={{
        state: initialFormState,
        blocks: [syntheticBlock],
        goToQuestion: () => {},
        setResponse: () => {},
        getResponse: () => undefined,
        addActiveBlock: () => {},
        isQuestionAnswered: () => false,
        navigateToNextQuestion: () => {},
        getProgress: () => 0,
        resetForm: () => {},
        getNavigationHistoryFor: () => undefined,
        getRepeatingGroupEntries: () => [],
        saveRepeatingGroupEntry: () => false,
        deleteRepeatingGroupEntry: () => false,
        subscribeToNavigation: () => (() => {})
      }}
    >
      <QuestionView />
    </FormContext.Provider>
  );
}
