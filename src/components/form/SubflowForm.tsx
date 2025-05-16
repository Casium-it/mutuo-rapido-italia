
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
  
  // Riferimenti per evitare navigazioni multiple o durante il reset
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef<number | null>(null);
  // Reference locale per i subscriber agli eventi di navigazione - IMPORTANTE: isolato dall'emettitore principale
  const navigationSubscribersRef = useRef<Array<(data: any) => void>>([]);
  
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
      // Garantisce che non ci siano stati di navigazione conflittuali
      isNavigating: false
    };
  }, [initialData, questions]);
  
  useEffect(() => {
    setFormState(initialFormState);
    setInitialized(true);
    
    // Cleanup quando il componente viene smontato
    return () => {
      // Cancella eventuali timeout di navigazione
      if (navigationTimeoutRef.current !== null) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
      
      // Rimuovi i subscriber
      navigationSubscribersRef.current = [];
    };
  }, [initialFormState]);

  // Funzione per normalizzare i dati prima di completare il subflow
  const normalizeData = useCallback((formResponses: Record<string, Record<string, any>>): RepeatingGroupEntry => {
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
  }, [initialData, questions]);
  
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
    // Prevenzione di navigazione simultanea
    if (isNavigatingRef.current) {
      console.log("Navigazione prevenuta: già in navigazione");
      return;
    }
    
    isNavigatingRef.current = true;
    
    setFormState(prevState => {
      // Registra la navigazione nella cronologia
      const navigationData = {
        from_block_id: prevState.activeQuestion.block_id,
        from_question_id: prevState.activeQuestion.question_id,
        to_block_id: blockId,
        to_question_id: questionId,
        timestamp: Date.now()
      };
      
      return {
        ...prevState,
        activeQuestion: { block_id: blockId, question_id: questionId },
        navigationHistory: [...prevState.navigationHistory, navigationData]
      };
    });
    
    // Reset dello stato di navigazione dopo un breve ritardo
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, []);

  // Handler per la navigazione nel FormContext isolato
  const navigateToNextQuestion = useCallback((fromQuestionId: string, toQuestionOrSignal: string) => {
    // Prevenzione di navigazione simultanea
    if (isNavigatingRef.current) {
      console.log("Navigazione 'next' prevenuta: già in navigazione");
      return;
    }
    
    isNavigatingRef.current = true;
    console.log(`[Subflow] Navigazione da ${fromQuestionId} a ${toQuestionOrSignal}`);
    
    // Notifica i subscriber della navigazione - IMPORTANTE: solo quelli locali
    navigationSubscribersRef.current.forEach(callback => {
      callback({
        fromQuestionId,
        toQuestionId: toQuestionOrSignal,
        fromBlockId: "subflow_synthetic_block",
        toBlockId: "subflow_synthetic_block",
        leadsToDest: toQuestionOrSignal
      });
    });
    
    // Se è stato specificato end_of_subflow, completa il subflow
    if (toQuestionOrSignal === endSignal) {
      console.log(`[Subflow] Rilevato segnale di fine ${endSignal}, completamento subflow`);
      // Normalizza i dati prima di completare
      if (formState && formState.responses) {
        const normalizedData = normalizeData(formState.responses);
        // Lasciamo un po' di tempo prima di chiamare onComplete per evitare problemi di race condition
        setTimeout(() => {
          isNavigatingRef.current = false;
          onComplete(normalizedData);
        }, 50);
      } else {
        isNavigatingRef.current = false;
      }
      return;
    }

    // Altrimenti, cerca la prossima domanda nel blocco sintetico
    const currentQuestionIndex = questions.findIndex(q => q.question_id === fromQuestionId);
    
    if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length - 1) {
      // Se c'è una prossima domanda nel blocco, vai a quella
      const nextQuestion = questions[currentQuestionIndex + 1];
      setFormState(prevState => {
        const navigationData = {
          from_block_id: "subflow_synthetic_block",
          from_question_id: fromQuestionId,
          to_block_id: "subflow_synthetic_block",
          to_question_id: nextQuestion.question_id,
          timestamp: Date.now()
        };
        
        return {
          ...prevState,
          activeQuestion: { 
            block_id: "subflow_synthetic_block", 
            question_id: nextQuestion.question_id 
          },
          navigationHistory: [...prevState.navigationHistory, navigationData]
        };
      });
      
      // Reset dello stato di navigazione dopo un breve ritardo
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 300);
    } else if (toQuestionOrSignal !== "next_block") {
      // Se è stato specificato un ID di domanda specifico, vai a quella
      const targetQuestion = questions.find(q => q.question_id === toQuestionOrSignal);
      if (targetQuestion) {
        setFormState(prevState => {
          const navigationData = {
            from_block_id: "subflow_synthetic_block",
            from_question_id: fromQuestionId,
            to_block_id: "subflow_synthetic_block",
            to_question_id: targetQuestion.question_id,
            timestamp: Date.now()
          };
          
          return {
            ...prevState,
            activeQuestion: { 
              block_id: "subflow_synthetic_block", 
              question_id: targetQuestion.question_id 
            },
            navigationHistory: [...prevState.navigationHistory, navigationData]
          };
        });
        
        // Reset dello stato di navigazione dopo un breve ritardo
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 300);
      } else {
        // Se non è stato trovato un target, considera che siamo alla fine
        if (formState && formState.responses) {
          const normalizedData = normalizeData(formState.responses);
          setTimeout(() => {
            isNavigatingRef.current = false;
            onComplete(normalizedData);
          }, 50);
        } else {
          isNavigatingRef.current = false;
        }
      }
    } else {
      // Se siamo all'ultima domanda o è stato specificato next_block, completa il subflow
      if (formState && formState.responses) {
        const normalizedData = normalizeData(formState.responses);
        setTimeout(() => {
          isNavigatingRef.current = false;
          onComplete(normalizedData);
        }, 50);
      } else {
        isNavigatingRef.current = false;
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
      console.log("[Subflow] Annullamento su richiesta dell'utente (back dalla prima domanda)");
      onCancel();
      return true; // Indica che abbiamo gestito l'evento
    }
    
    // Se non siamo alla prima domanda, naviga alla domanda precedente
    const currentIndex = questions.findIndex(q => q.question_id === fromQuestionId);
    if (currentIndex > 0) {
      const prevQuestion = questions[currentIndex - 1];
      goToQuestion("subflow_synthetic_block", prevQuestion.question_id);
      return true;
    }
    
    return false; // Lascia che il FormContext gestisca la navigazione normale
  }, [questions, onCancel, goToQuestion]);

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
      console.log(`[Subflow] handleNavigation: rilevato segnale di fine ${endSignal}`);
      // Normalizza i dati prima di completare
      const normalizedData = normalizeData(formResponses);
      onComplete(normalizedData);
    }
  }, [endSignal, onComplete, normalizeData]);

  // Sottoscrizione agli eventi di navigazione - ISOLATA dal contesto principale
  const subscribeToNavigation = useCallback((callback: any) => {
    navigationSubscribersRef.current.push(callback);
    
    // Funzione di cleanup per la sottoscrizione
    const unsubscribe = () => {
      navigationSubscribersRef.current = navigationSubscribersRef.current.filter(cb => cb !== callback);
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
