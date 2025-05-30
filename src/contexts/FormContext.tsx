import React, {
  createContext,
  useContext,
  useReducer,
  Dispatch,
  useEffect,
} from "react";
import {
  FormState,
  FormResponse,
  NavigationHistory,
  BlockActivationSource,
  PendingRemoval,
} from "@/types/form";
import { allBlocks } from "@/data/blocks";
import { useNavigate } from "react-router-dom";
import { Block } from "@/types/form";

type FormContextType = {
  state: FormState;
  setActiveBlocks: (blocks: string[]) => void;
  setActiveQuestion: (block_id: string, question_id: string) => void;
  setResponse: (
    question_id: string,
    placeholder_key: string,
    value: string | string[]
  ) => void;
  setAnsweredQuestions: (questions: Set<string>) => void;
  addAnsweredQuestion: (question_id: string) => void;
  setNavigating: (isNavigating: boolean) => void;
  setBackNavigation: (isBackNavigation: boolean) => void;
  addNavigationHistory: (history: NavigationHistory) => void;
  addDynamicBlock: (block: Block) => void;
  addActiveBlock: (blockId: string) => void;
  setBlockActivations: (
    questionId: string,
    placeholderId: string,
    blockId: string
  ) => void;
  addCompletedBlock: (blockId: string) => void;
  addPendingRemoval: (questionId: string, blockId: string) => void;
  removePendingRemoval: (questionId: string, blockId: string) => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialState: FormState = {
  activeBlocks: [],
  activeQuestion: { block_id: "", question_id: "" },
  responses: {},
  answeredQuestions: new Set(),
  isNavigating: false,
  isBackNavigation: false, // Initialize the new flag
  navigationHistory: [],
  dynamicBlocks: [],
  blockActivations: {},
  completedBlocks: [],
  pendingRemovals: []
};

type Action =
  | {
      type: "SET_ACTIVE_BLOCKS";
      payload: string[];
    }
  | {
      type: "SET_ACTIVE_QUESTION";
      payload: {
        block_id: string;
        question_id: string;
      };
    }
  | {
      type: "SET_RESPONSE";
      payload: {
        question_id: string;
        placeholder_key: string;
        value: string | string[];
      };
    }
  | {
      type: "SET_ANSWERED_QUESTIONS";
      payload: Set<string>;
    }
  | {
      type: "ADD_ANSWERED_QUESTION";
      payload: string;
    }
  | {
      type: "SET_NAVIGATING";
      payload: boolean;
    }
  | {
      type: "SET_BACK_NAVIGATION";
      payload: boolean
    }
  | {
      type: "ADD_NAVIGATION_HISTORY";
      payload: NavigationHistory;
    }
  | {
      type: "ADD_DYNAMIC_BLOCK";
      payload: Block;
    }
  | {
      type: "ADD_ACTIVE_BLOCK";
      payload: string;
    }
  | {
      type: "SET_BLOCK_ACTIVATIONS";
      payload: {
        questionId: string;
        placeholderId: string;
        blockId: string;
      };
    }
  | {
      type: "ADD_COMPLETED_BLOCK";
      payload: string;
    }
  | {
      type: "ADD_PENDING_REMOVAL";
      payload: {
        questionId: string;
        blockId: string;
        timestamp: number;
      };
    }
  | {
      type: "REMOVE_PENDING_REMOVAL";
      payload: {
        questionId: string;
        blockId: string;
      };
    };

function formReducer(state: FormState, action: any): FormState {
  switch (action.type) {
    case "SET_ACTIVE_BLOCKS":
      return { ...state, activeBlocks: action.payload };
    case "SET_ACTIVE_QUESTION":
      return { ...state, activeQuestion: action.payload };
    case "SET_RESPONSE":
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.payload.question_id]: {
            ...state.responses[action.payload.question_id],
            [action.payload.placeholder_key]: action.payload.value,
          },
        },
      };
    case "SET_ANSWERED_QUESTIONS":
      return { ...state, answeredQuestions: action.payload };
    case "ADD_ANSWERED_QUESTION":
      const newSet = new Set(state.answeredQuestions);
      newSet.add(action.payload);
      return { ...state, answeredQuestions: newSet };
    case "SET_NAVIGATING":
      return { ...state, isNavigating: action.payload };
    case 'SET_BACK_NAVIGATION':
      return {
        ...state,
        isBackNavigation: action.payload
      };
    case "ADD_NAVIGATION_HISTORY":
      return {
        ...state,
        navigationHistory: [...state.navigationHistory, action.payload],
      };
    case "ADD_DYNAMIC_BLOCK":
      return {
        ...state,
        dynamicBlocks: [...state.dynamicBlocks, action.payload],
      };
    case "ADD_ACTIVE_BLOCK":
      return {
        ...state,
        activeBlocks: [...state.activeBlocks, action.payload],
      };
    case "SET_BLOCK_ACTIVATIONS":
      return {
        ...state,
        blockActivations: {
          ...state.blockActivations,
          [action.payload.blockId]: [
            ...(state.blockActivations[action.payload.blockId] || []),
            {
              questionId: action.payload.questionId,
              placeholderId: action.payload.placeholderId,
            },
          ],
        },
      };
    case "ADD_COMPLETED_BLOCK":
      return {
        ...state,
        completedBlocks: [...state.completedBlocks, action.payload],
      };
    case "ADD_PENDING_REMOVAL":
      return {
        ...state,
        pendingRemovals: [...state.pendingRemovals, action.payload],
      };
    case "REMOVE_PENDING_REMOVAL":
      return {
        ...state,
        pendingRemovals: state.pendingRemovals.filter(
          (removal) =>
            removal.questionId !== action.payload.questionId &&
            removal.blockId !== action.payload.blockId
        ),
      };
    default:
      return state;
  }
}

type FormProviderProps = {
  children: React.ReactNode;
};

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const navigate = useNavigate();
  const blocks = allBlocks;

  useEffect(() => {
    // Load active blocks from local storage on component mount
    const storedActiveBlocks = localStorage.getItem("activeBlocks");
    if (storedActiveBlocks) {
      try {
        const parsedActiveBlocks = JSON.parse(storedActiveBlocks);
        if (Array.isArray(parsedActiveBlocks)) {
          setActiveBlocks(parsedActiveBlocks);
        } else {
          console.warn(
            "Invalid data in local storage for activeBlocks. Expected an array."
          );
        }
      } catch (error) {
        console.error("Error parsing activeBlocks from local storage:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Save active blocks to local storage whenever they change
    localStorage.setItem("activeBlocks", JSON.stringify(state.activeBlocks));
  }, [state.activeBlocks]);

  const setActiveBlocks = (blocks: string[]) => {
    dispatch({ type: "SET_ACTIVE_BLOCKS", payload: blocks });
  };

  const setActiveQuestion = (block_id: string, question_id: string) => {
    dispatch({
      type: "SET_ACTIVE_QUESTION",
      payload: { block_id, question_id },
    });
  };

  const setResponse = (
    question_id: string,
    placeholder_key: string,
    value: string | string[]
  ) => {
    dispatch({
      type: "SET_RESPONSE",
      payload: { question_id, placeholder_key, value },
    });
  };

  const setAnsweredQuestions = (questions: Set<string>) => {
    dispatch({ type: "SET_ANSWERED_QUESTIONS", payload: questions });
  };

  const addAnsweredQuestion = (question_id: string) => {
    dispatch({ type: "ADD_ANSWERED_QUESTION", payload: question_id });
  };

  const setNavigating = (isNavigating: boolean) => {
    dispatch({ type: "SET_NAVIGATING", payload: isNavigating });
  };

  const setBackNavigation = (isBackNavigation: boolean) => {
    dispatch({ type: 'SET_BACK_NAVIGATION', payload: isBackNavigation });
  };

  const addNavigationHistory = (history: NavigationHistory) => {
    dispatch({ type: "ADD_NAVIGATION_HISTORY", payload: history });
  };

  const addDynamicBlock = (block: Block) => {
    dispatch({ type: "ADD_DYNAMIC_BLOCK", payload: block });
  };

  const addActiveBlock = (blockId: string) => {
    dispatch({ type: "ADD_ACTIVE_BLOCK", payload: blockId });
  };

  const setBlockActivations = (
    questionId: string,
    placeholderId: string,
    blockId: string
  ) => {
    dispatch({
      type: "SET_BLOCK_ACTIVATIONS",
      payload: { questionId, placeholderId, blockId },
    });
  };

  const addCompletedBlock = (blockId: string) => {
    dispatch({ type: "ADD_COMPLETED_BLOCK", payload: blockId });
  };

  const addPendingRemoval = (questionId: string, blockId: string) => {
    dispatch({
      type: "ADD_PENDING_REMOVAL",
      payload: {
        questionId,
        blockId,
        timestamp: Date.now(),
      },
    });
  };

  const removePendingRemoval = (questionId: string, blockId: string) => {
    dispatch({
      type: "REMOVE_PENDING_REMOVAL",
      payload: { questionId, blockId },
    });
  };

  const value = {
    state,
    setActiveBlocks,
    setActiveQuestion,
    setResponse,
    setAnsweredQuestions,
    addAnsweredQuestion,
    setNavigating,
    setBackNavigation, // Add the new function
    addNavigationHistory,
    addDynamicBlock,
    addActiveBlock,
    setBlockActivations,
    addCompletedBlock,
    addPendingRemoval,
    removePendingRemoval
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};

export { FormContext };
