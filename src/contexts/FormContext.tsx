import React, { createContext, useContext, useReducer, useEffect } from "react";
import { allBlocks } from "@/data/blocks";
import { useNavigate } from "react-router-dom";
import { FormState, Block, NavigationHistory, BlockActivationSource, PendingRemoval } from "@/types/form";

interface FormContextType {
  state: FormState;
  blocks: Block[];
  setActiveBlocks: (blocks: string[]) => void;
  setActiveQuestion: (block_id: string, question_id: string) => void;
  setResponse: (question_id: string, placeholder_key: string, value: string | string[]) => void;
  getResponse: (question_id: string, placeholder_key: string) => string | string[] | undefined;
  setAnsweredQuestions: (questions: Set<string>) => void;
  addAnsweredQuestion: (question_id: string) => void;
  setNavigating: (isNavigating: boolean) => void;
  setBackNavigation: (isBackNavigation: boolean) => void; // New function
  addNavigationHistory: (history: NavigationHistory) => void;
  addDynamicBlock: (block: Block) => void;
  addActiveBlock: (blockId: string) => void;
  setBlockActivations: (questionId: string, placeholderId: string, blockId: string) => void;
  addCompletedBlock: (blockId: string) => void;
  addPendingRemoval: (questionId: string, blockId: string) => void;
  removePendingRemoval: (questionId: string, blockId: string) => void;
  navigateToNextQuestion: (currentQuestionId: string, targetId: string) => void;
  goToQuestion: (blockId: string, questionId: string) => void;
  createDynamicBlock: (blueprintId: string) => string;
  deleteDynamicBlock: (blockId: string) => boolean;
  removeActiveBlock: (blockId: string) => void;
  deleteQuestionResponses: (questionIds: string[]) => void;
  isBlockCompleted: (blockId: string) => boolean;
  markBlockAsCompleted: (blockId: string) => void;
  initializeForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const initialState: FormState = {
  activeBlocks: [],
  activeQuestion: {
    block_id: "",
    question_id: ""
  },
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

type FormAction =
  | { type: "SET_ACTIVE_BLOCKS"; payload: string[] }
  | { type: "SET_ACTIVE_QUESTION"; payload: { block_id: string; question_id: string } }
  | { type: "SET_RESPONSE"; payload: { question_id: string; placeholder_key: string; value: string | string[] } }
  | { type: "SET_ANSWERED_QUESTIONS"; payload: Set<string> }
  | { type: "ADD_ANSWERED_QUESTION"; payload: string }
  | { type: "SET_NAVIGATING"; payload: boolean }
  | { type: "SET_BACK_NAVIGATION"; payload: boolean } // New action
  | { type: "ADD_NAVIGATION_HISTORY"; payload: NavigationHistory }
  | { type: "ADD_DYNAMIC_BLOCK"; payload: Block }
  | { type: "ADD_ACTIVE_BLOCK"; payload: string }
  | { type: "SET_BLOCK_ACTIVATIONS"; payload: { questionId: string; placeholderId: string; blockId: string } }
  | { type: "ADD_COMPLETED_BLOCK"; payload: string }
  | { type: "ADD_PENDING_REMOVAL"; payload: PendingRemoval }
  | { type: "REMOVE_PENDING_REMOVAL"; payload: { questionId: string; blockId: string } }
  | { type: "DELETE_DYNAMIC_BLOCK"; payload: string }
  | { type: "REMOVE_ACTIVE_BLOCK"; payload: string }
  | { type: "DELETE_QUESTION_RESPONSES"; payload: string[] };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_ACTIVE_BLOCKS":
      return {
        ...state,
        activeBlocks: action.payload
      };
    case "SET_ACTIVE_QUESTION":
      return {
        ...state,
        activeQuestion: action.payload
      };
    case "SET_RESPONSE":
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.payload.question_id]: {
            ...state.responses[action.payload.question_id],
            [action.payload.placeholder_key]: action.payload.value
          }
        }
      };
    case "SET_ANSWERED_QUESTIONS":
      return {
        ...state,
        answeredQuestions: action.payload
      };
    case "ADD_ANSWERED_QUESTION":
      const newSet = new Set(state.answeredQuestions);
      newSet.add(action.payload);
      return {
        ...state,
        answeredQuestions: newSet
      };
    case "SET_NAVIGATING":
      return {
        ...state,
        isNavigating: action.payload
      };
    case "SET_BACK_NAVIGATION": // New case
      return {
        ...state,
        isBackNavigation: action.payload
      };
    case "ADD_NAVIGATION_HISTORY":
      return {
        ...state,
        navigationHistory: [...state.navigationHistory, action.payload]
      };
    case "ADD_DYNAMIC_BLOCK":
      return {
        ...state,
        dynamicBlocks: [...state.dynamicBlocks, action.payload]
      };
    case "ADD_ACTIVE_BLOCK":
      return {
        ...state,
        activeBlocks: [...state.activeBlocks, action.payload]
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
              placeholderId: action.payload.placeholderId
            }
          ]
        }
      };
    case "ADD_COMPLETED_BLOCK":
      return {
        ...state,
        completedBlocks: [...state.completedBlocks, action.payload]
      };
    case "ADD_PENDING_REMOVAL":
      return {
        ...state,
        pendingRemovals: [...state.pendingRemovals, action.payload]
      };
    case "REMOVE_PENDING_REMOVAL":
      return {
        ...state,
        pendingRemovals: state.pendingRemovals.filter(
          removal => removal.questionId !== action.payload.questionId && removal.blockId !== action.payload.blockId
        )
      };
    case "DELETE_DYNAMIC_BLOCK":
      return {
        ...state,
        dynamicBlocks: state.dynamicBlocks.filter(block => block.block_id !== action.payload)
      };
    case "REMOVE_ACTIVE_BLOCK":
      return {
        ...state,
        activeBlocks: state.activeBlocks.filter(blockId => blockId !== action.payload)
      };
    case "DELETE_QUESTION_RESPONSES":
      const newResponses = { ...state.responses };
      action.payload.forEach(questionId => {
        delete newResponses[questionId];
      });
      return {
        ...state,
        responses: newResponses
      };
    default:
      return state;
  }
}

export interface FormProviderProps {
  children: React.ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const navigate = useNavigate();
  const blocks = allBlocks;

  useEffect(() => {
    const storedState = localStorage.getItem("formState");
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      // Convert answeredQuestions back to a Set
      parsedState.answeredQuestions = new Set(parsedState.answeredQuestions);
      dispatch({ type: "SET_ACTIVE_BLOCKS", payload: parsedState.activeBlocks });
      dispatch({ type: "SET_ACTIVE_QUESTION", payload: parsedState.activeQuestion });
      dispatch({ type: "SET_RESPONSE", payload: parsedState.responses });
      dispatch({ type: "SET_ANSWERED_QUESTIONS", payload: parsedState.answeredQuestions });
      dispatch({ type: "SET_NAVIGATING", payload: parsedState.isNavigating });
      dispatch({ type: "SET_BACK_NAVIGATION", payload: parsedState.isBackNavigation });
      dispatch({ type: "ADD_NAVIGATION_HISTORY", payload: parsedState.navigationHistory });
      dispatch({ type: "ADD_DYNAMIC_BLOCK", payload: parsedState.dynamicBlocks });
      dispatch({ type: "ADD_ACTIVE_BLOCK", payload: parsedState.activeBlocks });
      dispatch({ type: "SET_BLOCK_ACTIVATIONS", payload: parsedState.blockActivations });
      dispatch({ type: "ADD_COMPLETED_BLOCK", payload: parsedState.completedBlocks });
      dispatch({ type: "ADD_PENDING_REMOVAL", payload: parsedState.pendingRemovals });
    }
  }, []);

  useEffect(() => {
    // Convert answeredQuestions to an Array before storing
    const stateToStore = {
      ...state,
      answeredQuestions: Array.from(state.answeredQuestions)
    };
    localStorage.setItem("formState", JSON.stringify(stateToStore));
  }, [state]);

  const setActiveBlocks = (blocks: string[]) => {
    dispatch({ type: "SET_ACTIVE_BLOCKS", payload: blocks });
  };

  const setActiveQuestion = (block_id: string, question_id: string) => {
    dispatch({ type: "SET_ACTIVE_QUESTION", payload: { block_id, question_id } });
  };

  const setResponse = (question_id: string, placeholder_key: string, value: string | string[]) => {
    dispatch({ type: "SET_RESPONSE", payload: { question_id, placeholder_key, value } });
  };

  const getResponse = (question_id: string, placeholder_key: string) => {
    return state.responses[question_id]?.[placeholder_key];
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
    dispatch({ type: "SET_BACK_NAVIGATION", payload: isBackNavigation });
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

  const setBlockActivations = (questionId: string, placeholderId: string, blockId: string) => {
    dispatch({ type: "SET_BLOCK_ACTIVATIONS", payload: { questionId, placeholderId, blockId } });
  };

  const addCompletedBlock = (blockId: string) => {
    dispatch({ type: "ADD_COMPLETED_BLOCK", payload: blockId });
  };

  const addPendingRemoval = (questionId: string, blockId: string) => {
    dispatch({ type: "ADD_PENDING_REMOVAL", payload: { questionId, blockId, timestamp: Date.now() } });
  };

  const removePendingRemoval = (questionId: string, blockId: string) => {
    dispatch({ type: "REMOVE_PENDING_REMOVAL", payload: { questionId, blockId } });
  };

  const deleteDynamicBlock = (blockId: string): boolean => {
    dispatch({ type: "DELETE_DYNAMIC_BLOCK", payload: blockId });
    return true;
  };

  const removeActiveBlock = (blockId: string) => {
    dispatch({ type: "REMOVE_ACTIVE_BLOCK", payload: blockId });
  };

  const deleteQuestionResponses = (questionIds: string[]) => {
    dispatch({ type: "DELETE_QUESTION_RESPONSES", payload: questionIds });
  };

  const isBlockCompleted = (blockId: string): boolean => {
    return state.completedBlocks.includes(blockId);
  };

  const markBlockAsCompleted = (blockId: string) => {
    if (!state.completedBlocks.includes(blockId)) {
      dispatch({ type: "ADD_COMPLETED_BLOCK", payload: blockId });
    }
  };

  const navigateToNextQuestion = (currentQuestionId: string, targetId: string) => {
    let nextBlockId: string | undefined;
    let nextQuestionId: string | undefined;

    if (targetId === "next_block") {
      // Find the current block
      const currentBlockIndex = blocks.findIndex(
        (block) => block.block_id === state.activeQuestion.block_id
      );

      // If the current block is not the last one
      if (currentBlockIndex < blocks.length - 1) {
        // Get the next block
        const nextBlock = blocks[currentBlockIndex + 1];
        nextBlockId = nextBlock.block_id;
        // Get the first question of the next block
        nextQuestionId = nextBlock.questions[0].question_id;
      } else {
        // If the current block is the last one, do nothing
        return;
      }
    } else {
      // Find the target question
      const targetQuestion = blocks
        .flatMap((block) => block.questions)
        .find((question) => question.question_id === targetId);

      if (targetQuestion) {
        nextBlockId = targetQuestion.block_id;
        nextQuestionId = targetQuestion.question_id;
      } else {
        // If the target question is not found, do nothing
        return;
      }
    }

    if (nextBlockId && nextQuestionId) {
      setActiveQuestion(nextBlockId, nextQuestionId);
      navigate(`/form/${nextBlockId}/${nextQuestionId}`);
    }
  };

  const goToQuestion = (blockId: string, questionId: string) => {
    setActiveQuestion(blockId, questionId);
    navigate(`/form/${blockId}/${questionId}`);
  };

  const createDynamicBlock = (blueprintId: string): string => {
    const newBlockId = `${blueprintId}_${Date.now()}`;
    const blueprint = allBlocks.find(block => block.blueprint_id === blueprintId);

    if (blueprint) {
      const newBlock: Block = {
        ...blueprint,
        block_id: newBlockId,
        blueprint_id: blueprintId,
        title: blueprint.title,
        copy_number: state.dynamicBlocks.filter(b => b.blueprint_id?.startsWith(blueprintId)).length + 1,
      };
      dispatch({ type: "ADD_DYNAMIC_BLOCK", payload: newBlock });
      return newBlockId;
    } else {
      console.error(`Blueprint with id ${blueprintId} not found.`);
      return "";
    }
  };

  const initializeForm = () => {
    const firstBlock = allBlocks[0];
    setActiveBlocks([firstBlock.block_id]);
    setActiveQuestion(firstBlock.block_id, firstBlock.questions[0].question_id);
    navigate(`/form/${firstBlock.block_id}/${firstBlock.questions[0].question_id}`);
  };

  const value: FormContextType = {
    state,
    blocks,
    setActiveBlocks,
    setActiveQuestion,
    setResponse,
    getResponse,
    setAnsweredQuestions,
    addAnsweredQuestion,
    setNavigating,
    setBackNavigation,
    addNavigationHistory,
    addDynamicBlock,
    addActiveBlock,
    setBlockActivations,
    addCompletedBlock,
    addPendingRemoval,
    removePendingRemoval,
    navigateToNextQuestion,
    goToQuestion,
    createDynamicBlock,
    deleteDynamicBlock,
    removeActiveBlock,
    deleteQuestionResponses,
    isBlockCompleted,
    markBlockAsCompleted,
    initializeForm
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};

export const useFormContext = useForm; // Alias for backward compatibility
