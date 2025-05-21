
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback, useRef } from "react";
import { Block, FormResponse, NavigationHistory } from "@/types/form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ensureBlockHasPriority } from "@/utils/blockUtils";
import { formReducer, initialState } from "./FormReducer";
import { FormContextType, FormState } from "./FormTypes";
import { useFormBasic } from "../hooks/useForm";
import { useFormNavigation } from "../hooks/useFormNavigation";
import { useFormDynamicBlocks } from "../hooks/useFormDynamicBlocks";

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode; blocks: Block[] }> = ({ children, blocks }) => {
  const navigate = useNavigate();
  const params = useParams<{ blockType?: string; blockId?: string; questionId?: string }>();
  const location = useLocation();
  
  const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
  
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    activeBlocks: sortedBlocks.filter(b => b.default_active).map(b => b.block_id),
    dynamicBlocks: [],
    blockActivations: {},
    completedBlocks: []
  });

  // Funzione per trovare a quale blocco appartiene una domanda specifica
  const findBlockByQuestionId = useCallback((questionId: string): string | null => {
    // Cerca prima nei blocchi normali
    for (const block of sortedBlocks) {
      const hasQuestion = block.questions.some(q => q.question_id === questionId);
      if (hasQuestion) {
        return block.block_id;
      }
    }
    
    // Se non trovato, cerca nei blocchi dinamici
    for (const block of state.dynamicBlocks) {
      const hasQuestion = block.questions.some(q => q.question_id === questionId);
      if (hasQuestion) {
        return block.block_id;
      }
    }
    
    return null;
  }, [sortedBlocks, state.dynamicBlocks]);
  
  // Usa gli hook form specifici
  const basicFormFunctions = useFormBasic({ dispatch, state });
  
  const navigationFunctions = useFormNavigation({ 
    dispatch, 
    state, 
    blocks: sortedBlocks,
    findBlockByQuestionId,
    markBlockAsCompleted: basicFormFunctions.markBlockAsCompleted
  });
  
  // Inizializza le funzioni per i blocchi dinamici
  const dynamicBlocksFunctions = useFormDynamicBlocks({
    dispatch,
    state,
    blocks: sortedBlocks
  });
  
  // Otteniamo i riferimenti per la navigazione
  const { 
    previousBlockIdRef, 
    previousQuestionIdRef, 
    usedNextBlockNavRef 
  } = navigationFunctions.getNavigationRefs();
  
  // Mantieni traccia della navigazione per completare correttamente i blocchi
  useEffect(() => {
    // Esegui solo quando isNavigating passa da true a false (navigazione completata)
    const wasNavigating = previousBlockIdRef.current === true;
    if (wasNavigating && state.isNavigating === false) {
      // Memorizziamo l'ID del blocco da cui stiamo arrivando (blocco precedente)
      const blockWeLeavingFrom = previousBlockIdRef.current as string;
      
      // Assicurati di avere un blocco precedente valido e diverso da quello attuale
      if (blockWeLeavingFrom && 
          blockWeLeavingFrom !== state.activeQuestion.block_id && 
          blockWeLeavingFrom !== null &&
          usedNextBlockNavRef.current) {
        // Contrassegna il blocco da cui proveniamo come completato - ma solo se abbiamo usato la navigazione "next_block"
        basicFormFunctions.markBlockAsCompleted(blockWeLeavingFrom);
        
        // Reimposta il flag dopo il completamento
        usedNextBlockNavRef.current = false;
      }
    }
    
    // Aggiorna i riferimenti per il confronto successivo - questi dovrebbero essere eseguiti DOPO la logica di completamento sopra
    if (state.isNavigating === false) {
      previousQuestionIdRef.current = state.activeQuestion.question_id;
      previousBlockIdRef.current = state.activeQuestion.block_id;
    }
    
    // Aggiorna sempre il riferimento dello stato di navigazione
    previousBlockIdRef.current = state.isNavigating;
  }, [state.isNavigating, state.activeQuestion.block_id, state.activeQuestion.question_id, basicFormFunctions]);

  // Reset del form
  const resetForm = useCallback(() => {
    if (params.blockType) {
      localStorage.removeItem(`form-state-${params.blockType}`);
    }
    
    dispatch({ type: "RESET_FORM" });
    
    navigate("/simulazione/pensando/introduzione/soggetto_acquisto", { replace: true });
  }, [params.blockType, navigate]);

  // Gestione dei blocchi predefiniti e del caricamento dello stato salvato
  useEffect(() => {
    const { blockId, questionId } = params;
    
    if (blockId && questionId) {
      dispatch({ 
        type: "GO_TO_QUESTION", 
        block_id: blockId, 
        question_id: questionId 
      });
      
      if (!state.activeBlocks.includes(blockId)) {
        dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
      }
    } else if (blockId) {
      const block = blocks.find(b => b.block_id === blockId);
      if (block && block.questions.length > 0) {
        const firstQuestionId = block.questions[0].question_id;
        dispatch({ 
          type: "GO_TO_QUESTION", 
          block_id: blockId, 
          question_id: firstQuestionId 
        });
        
        if (!state.activeBlocks.includes(blockId)) {
          dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
        }
        
        navigate(`/simulazione/${params.blockType}/${blockId}/${firstQuestionId}`, { replace: true });
      }
    } else if (params.blockType) {
      const entryBlock = blocks.find(b => b.block_id === "introduzione");
      if (entryBlock && entryBlock.questions.length > 0) {
        dispatch({ 
          type: "GO_TO_QUESTION", 
          block_id: "introduzione", 
          question_id: "soggetto_acquisto" 
        });
      }
    }
    
    const savedState = localStorage.getItem(`form-state-${params.blockType}`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Converti l'array di domande risposte in un Set
        if (Array.isArray(parsedState.answeredQuestions)) {
          parsedState.answeredQuestions = new Set(parsedState.answeredQuestions);
        } else {
          parsedState.answeredQuestions = new Set();
        }
        
        // Assicurati che tutti i blocchi dinamici abbiano priorità
        if (Array.isArray(parsedState.dynamicBlocks)) {
          parsedState.dynamicBlocks = parsedState.dynamicBlocks.map(block => 
            ensureBlockHasPriority(block)
          );
        } else {
          parsedState.dynamicBlocks = [];
        }
        
        dispatch({ type: "SET_FORM_STATE", state: parsedState });
        
        // Aggiungi blocchi attivi dallo stato salvato
        if (parsedState.activeBlocks) {
          parsedState.activeBlocks.forEach((blockId: string) => {
            if (!state.activeBlocks.includes(blockId)) {
              dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
            }
          });
        }
        
        // Attiva blocchi richiesti in base alle risposte
        if (parsedState.responses) {
          activateRequiredBlocksBasedOnResponses(parsedState.responses);
        }
      } catch (e) {
        console.error("Errore nel caricamento dello stato salvato:", e);
      }
    }
  }, [params.blockId, params.questionId, params.blockType, blocks, navigate, state.activeBlocks]);

  // Salva lo stato del form nel localStorage
  useEffect(() => {
    if (params.blockType) {
      const stateToSave = {
        ...state,
        answeredQuestions: Array.from(state.answeredQuestions)
      };
      localStorage.setItem(`form-state-${params.blockType}`, JSON.stringify(stateToSave));
    }
  }, [state, params.blockType]);

  // Funzione per attivare i blocchi richiesti in base alle risposte
  const activateRequiredBlocksBasedOnResponses = (responses: FormResponse) => {
    for (const questionId of Object.keys(responses)) {
      for (const blockObj of blocks) {
        const question = blockObj.questions.find(q => q.question_id === questionId);
        if (!question) continue;

        for (const [placeholderKey, value] of Object.entries(responses[questionId])) {
          if (question.placeholders[placeholderKey].type === "select") {
            const options = (question.placeholders[placeholderKey] as any).options;
            if (!Array.isArray(value)) {
              const selectedOption = options.find((opt: any) => opt.id === value);
              if (selectedOption?.add_block && !state.activeBlocks.includes(selectedOption.add_block)) {
                dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: selectedOption.add_block });
              }
            } else {
              for (const optionId of value) {
                const selectedOption = options.find((opt: any) => opt.id === optionId);
                if (selectedOption?.add_block && !state.activeBlocks.includes(selectedOption.add_block)) {
                  dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: selectedOption.add_block });
                }
              }
            }
          }
        }
      }
    }
  };

  return (
    <FormContext.Provider
      value={{
        state,
        blocks: [
          ...sortedBlocks,
          ...state.dynamicBlocks
        ].sort((a, b) => a.priority - b.priority), 
        ...basicFormFunctions,
        ...navigationFunctions,
        ...dynamicBlocksFunctions,
        resetForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};
