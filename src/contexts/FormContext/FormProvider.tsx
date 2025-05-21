
import React, { createContext, useReducer, ReactNode, useEffect, useCallback } from "react";
import { Block, FormState } from "@/types/form";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ensureBlockHasPriority } from "@/utils/blockUtils";
import { formReducer, Action } from "./formReducer";
import { createInitialState } from "./formState";

// Tipo del contesto
export type FormContextType = {
  state: FormState;
  blocks: Block[];
  dispatch: React.Dispatch<Action>;
  goToQuestion: (block_id: string, question_id: string, replace?: boolean) => void;
  [key: string]: any; // Per supportare le altre proprietà che aggiungeremo
};

// Crea il contesto
export const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode; blocks: Block[] }> = ({ children, blocks }) => {
  const navigate = useNavigate();
  const params = useParams<{ blockType?: string; blockId?: string; questionId?: string }>();
  const location = useLocation();
  
  // Ordina i blocchi per priorità
  const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
  
  // Inizializza lo stato del form
  const [state, dispatch] = useReducer(formReducer, createInitialState(sortedBlocks));

  // Funzione per navigare a una domanda
  const goToQuestion = useCallback((block_id: string, question_id: string, replace = false) => {
    const previousBlockId = state.activeQuestion.block_id;
    const previousQuestionId = state.activeQuestion.question_id;

    dispatch({ type: "GO_TO_QUESTION", block_id, question_id });
    
    dispatch({ 
      type: "ADD_NAVIGATION_HISTORY", 
      history: {
        from_block_id: previousBlockId,
        from_question_id: previousQuestionId,
        to_block_id: block_id,
        to_question_id: question_id,
        timestamp: Date.now()
      }
    });
    
    dispatch({ type: "SET_NAVIGATING", isNavigating: true });
    
    const blockType = params.blockType || "funnel";
    const newPath = `/simulazione/${blockType}/${block_id}/${question_id}`;
    
    if (replace) {
      navigate(newPath, { replace: true });
    } else {
      navigate(newPath);
    }
    
    setTimeout(() => {
      dispatch({ type: "SET_NAVIGATING", isNavigating: false });
    }, 300);
  }, [params.blockType, navigate, state.activeQuestion]);

  // Reset del form
  const resetForm = useCallback(() => {
    if (params.blockType) {
      localStorage.removeItem(`form-state-${params.blockType}`);
    }
    
    dispatch({ type: "RESET_FORM" });
    
    navigate("/simulazione/pensando/introduzione/soggetto_acquisto", { replace: true });
  }, [params.blockType, navigate]);

  // Attiva i blocchi predefiniti
  useEffect(() => {
    const defaultActiveBlockIds = blocks
      .filter(b => b.default_active)
      .map(b => b.block_id);
    
    defaultActiveBlockIds.forEach(blockId => {
      if (!state.activeBlocks.includes(blockId)) {
        dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
      }
    });
  }, [blocks]);

  // Sincronizzazione con l'URL e localStorage
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
    
    // Carica lo stato salvato dal localStorage
    const savedState = localStorage.getItem(`form-state-${params.blockType}`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Converti l'array di risposte in un Set
        if (Array.isArray(parsedState.answeredQuestions)) {
          parsedState.answeredQuestions = new Set(parsedState.answeredQuestions);
        } else {
          parsedState.answeredQuestions = new Set();
        }
        
        // Assicurati che i blocchi dinamici abbiano priorità
        if (Array.isArray(parsedState.dynamicBlocks)) {
          parsedState.dynamicBlocks = parsedState.dynamicBlocks.map(block => 
            ensureBlockHasPriority(block)
          );
        } else {
          parsedState.dynamicBlocks = [];
        }
        
        dispatch({ type: "SET_FORM_STATE", state: parsedState });
        
        // Attiva i blocchi necessari
        if (parsedState.activeBlocks) {
          parsedState.activeBlocks.forEach((blockId: string) => {
            if (!state.activeBlocks.includes(blockId)) {
              dispatch({ type: "ADD_ACTIVE_BLOCK", block_id: blockId });
            }
          });
        }
      } catch (e) {
        console.error("Errore nel caricamento dello stato salvato:", e);
      }
    }
  }, [params.blockId, params.questionId, params.blockType, blocks, navigate]);

  // Salvataggio stato in localStorage
  useEffect(() => {
    if (params.blockType) {
      const stateToSave = {
        ...state,
        answeredQuestions: Array.from(state.answeredQuestions)
      };
      localStorage.setItem(`form-state-${params.blockType}`, JSON.stringify(stateToSave));
    }
  }, [state, params.blockType]);
  
  return (
    <FormContext.Provider
      value={{
        state,
        blocks: [
          ...sortedBlocks,
          ...state.dynamicBlocks
        ].sort((a, b) => a.priority - b.priority), 
        dispatch,
        goToQuestion,
        resetForm
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
