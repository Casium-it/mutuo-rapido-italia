
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Question, RepeatingGroupEntry } from '@/types/form';
import { FormContext } from '@/contexts/FormContext';
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
  const [formState, setFormState] = useState<any>(null);
  
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
      answeredQuestions: new Set<string>(),
      navigationHistory: [],
    };
  }, [initialData, questions]);
  
  useEffect(() => {
    setFormState(initialFormState);
    setInitialized(true);
  }, [initialFormState]);

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
  
  // Implementazione effettiva delle funzioni di FormContext
  const setResponse = useCallback((questionId: string, placeholderKey: string, value: any) => {
    setFormState(prevState => {
      const newResponses = { ...prevState.responses };
      if (!newResponses[questionId]) {
        newResponses[questionId] = {};
      }
      newResponses[questionId][placeholderKey] = value;

      const newAnsweredQuestions = new Set(prevState.answeredQuestions);
      newAnsweredQuestions.add(questionId);

      return {
        ...prevState,
        responses: newResponses,
        answeredQuestions: newAnsweredQuestions
      };
    });
  }, []);

  const getResponse = useCallback((questionId: string, placeholderKey: string) => {
    if (!formState || !formState.responses || !formState.responses[questionId]) {
      return undefined;
    }
    return formState.responses[questionId][placeholderKey];
  }, [formState]);

  const isQuestionAnswered = useCallback((questionId: string) => {
    return formState && formState.answeredQuestions.has(questionId);
  }, [formState]);

  const goToQuestion = useCallback((blockId: string, questionId: string) => {
    setFormState(prevState => ({
      ...prevState,
      activeQuestion: { block_id: blockId, question_id: questionId }
    }));
  }, []);

  // Handler per la navigazione nel FormContext isolato
  const navigateToNextQuestion = useCallback((fromQuestionId: string, toQuestionOrSignal: string) => {
    // Se è stato specificato end_of_subflow, completa il subflow
    if (toQuestionOrSignal === endSignal) {
      // Normalizza i dati prima di completare
      if (formState && formState.responses) {
        const normalizedData = normalizeData(formState.responses);
        onComplete(normalizedData);
      }
      return;
    }

    // Altrimenti, cerca la prossima domanda nel blocco sintetico
    const currentQuestionIndex = questions.findIndex(q => q.question_id === fromQuestionId);
    
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length - 1) {
      // Se c'è una prossima domanda nel blocco, vai a quella
      const nextQuestion = questions[currentQuestionIndex + 1];
      setFormState(prevState => ({
        ...prevState,
        activeQuestion: { 
          block_id: "subflow_synthetic_block", 
          question_id: nextQuestion.question_id 
        },
        navigationHistory: [
          ...prevState.navigationHistory,
          {
            from_block_id: "subflow_synthetic_block",
            from_question_id: fromQuestionId,
            to_block_id: "subflow_synthetic_block",
            to_question_id: nextQuestion.question_id,
            timestamp: Date.now()
          }
        ]
      }));
    } else if (toQuestionOrSignal !== "next_block") {
      // Se è stato specificato un ID di domanda specifico, vai a quella
      const targetQuestion = questions.find(q => q.question_id === toQuestionOrSignal);
      if (targetQuestion) {
        setFormState(prevState => ({
          ...prevState,
          activeQuestion: { 
            block_id: "subflow_synthetic_block", 
            question_id: targetQuestion.question_id 
          },
          navigationHistory: [
            ...prevState.navigationHistory,
            {
              from_block_id: "subflow_synthetic_block",
              from_question_id: fromQuestionId,
              to_block_id: "subflow_synthetic_block",
              to_question_id: targetQuestion.question_id,
              timestamp: Date.now()
            }
          ]
        }));
      } else {
        // Se non è stato trovato un target, considera che siamo alla fine
        const normalizedData = normalizeData(formState.responses);
        onComplete(normalizedData);
      }
    } else {
      // Se siamo all'ultima domanda o è stato specificato next_block, completa il subflow
      if (formState && formState.responses) {
        const normalizedData = normalizeData(formState.responses);
        onComplete(normalizedData);
      }
    }
  }, [questions, formState, endSignal, onComplete, normalizeData]);

  // Handler per il tasto indietro che porta all'annullamento del subflow
  const handleBack = useCallback((
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
  }, [questions, onCancel]);

  // Handler per la navigazione
  const handleNavigation = useCallback((
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
  }, [endSignal, onComplete, normalizeData]);

  // Sottoscrizione agli eventi di navigazione
  const subscribeToNavigation = useCallback((callback: any) => {
    // Implementa la logica per intercettare eventi di navigazione
    const unsubscribe = () => {
      // Funzione di cleanup
    };
    return unsubscribe;
  }, []);

  // Se non siamo stati ancora inizializzati, mostra un loader
  if (!initialized || !formState) {
    return <div className="p-4 text-center">Caricamento...</div>;
  }

  return (
    <FormContext.Provider 
      value={{
        state: formState,
        blocks: [syntheticBlock],
        goToQuestion: goToQuestion,
        setResponse: setResponse,
        getResponse: getResponse,
        addActiveBlock: (blockId: string) => {
          // In un subflow, non aggiungiamo altri blocchi
        },
        isQuestionAnswered: isQuestionAnswered,
        navigateToNextQuestion: navigateToNextQuestion,
        getProgress: () => {
          // Calcola il progresso in base al numero di domande risposte / totale
          const answeredCount = formState.answeredQuestions.size;
          return Math.min(100, Math.floor((answeredCount / questions.length) * 100));
        },
        resetForm: () => {
          // Reset del form agli stati iniziali
          setFormState(initialFormState);
        },
        getNavigationHistoryFor: (questionId: string) => {
          return formState.navigationHistory.filter(
            (entry: any) => entry.from_question_id === questionId || entry.to_question_id === questionId
          );
        },
        getRepeatingGroupEntries: () => [],
        saveRepeatingGroupEntry: () => false,
        deleteRepeatingGroupEntry: () => false,
        subscribeToNavigation: subscribeToNavigation
      }}
    >
      <QuestionView />
    </FormContext.Provider>
  );
}
