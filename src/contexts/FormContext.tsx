import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Block,
  FormResponse,
  FormState,
  NavigationHistory,
  BlockActivationSource,
  PendingRemoval,
} from "@/types/form";
import { initialBlocks } from "@/data/formConfig";

type Action =
  | { type: "SET_ACTIVE_QUESTION"; payload: { block_id: string; question_id: string } }
  | { type: "SET_RESPONSE"; payload: { question_id: string; placeholder_key: string; value: string | string[] } }
  | { type: "SET_NAVIGATION"; payload: boolean }
  | { type: "SET_BACK_NAVIGATION"; payload: boolean }
  | { type: "ADD_ACTIVE_BLOCK"; payload: string }
  | { type: "REMOVE_ACTIVE_BLOCK"; payload: string }
  | { type: "ADD_ANSWERED_QUESTION"; payload: string }
  | { type: "ADD_NAVIGATION_HISTORY"; payload: NavigationHistory }
  | { type: "CREATE_DYNAMIC_BLOCK"; payload: Block }
  | { type: "DELETE_DYNAMIC_BLOCK"; payload: string }
  | { type: "ADD_BLOCK_ACTIVATION"; payload: { blockId: string; source: BlockActivationSource } }
  | { type: "DELETE_QUESTION_RESPONSES"; payload: string[] }
  | { type: "MARK_BLOCK_COMPLETED"; payload: string }
  | { type: "REMOVE_BLOCK_FROM_COMPLETED"; payload: string }
  | { type: "ADD_PENDING_REMOVAL"; payload: PendingRemoval }
  | { type: "REMOVE_PENDING_REMOVAL"; payload: string };

const initialState: FormState = {
  activeBlocks: ["introduzione"],
  activeQuestion: {
    block_id: "introduzione",
    question_id: "domanda-01",
  },
  responses: {},
  answeredQuestions: new Set(),
  isNavigating: false,
  isBackNavigation: false,
  navigationHistory: [],
  dynamicBlocks: [],
  blockActivations: {},
  completedBlocks: [],
  pendingRemovals: [],
};

type FormContextType = {
  state: FormState;
  blocks: Block[];
  goToQuestion: (block_id: string, question_id: string, skipNavigation?: boolean) => void;
  setResponse: (question_id: string, placeholder_key: string, value: string | string[]) => void;
  setNavigating: (isNavigating: boolean) => void;
  setBackNavigation: (isBack: boolean) => void;
  addActiveBlock: (blockId: string) => void;
  removeActiveBlock: (blockId: string) => void;
  addAnsweredQuestion: (questionId: string) => void;
  navigateToNextQuestion: (questionId: string, leadsTo: string) => void;
  createDynamicBlock: (blockBlueprintId: string) => string;
  deleteDynamicBlock: (blockId: string) => boolean;
  deleteQuestionResponses: (questionIds: string[]) => void;
  isBlockCompleted: (blockId: string) => boolean;
  markBlockAsCompleted: (blockId: string) => void;
  removeBlockFromCompleted: (blockId: string) => void;
  addPendingRemoval: (questionId: string, blockId: string) => void;
  removePendingRemoval: (questionId: string) => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "SET_ACTIVE_QUESTION":
      return {
        ...state,
        activeQuestion: action.payload,
      };
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
    case "SET_NAVIGATION":
      return {
        ...state,
        isNavigating: action.payload,
      };
    case "SET_BACK_NAVIGATION":
      return {
        ...state,
        isBackNavigation: action.payload,
      };
    case "ADD_ACTIVE_BLOCK":
      return {
        ...state,
        activeBlocks: [...state.activeBlocks, action.payload],
      };
    case "REMOVE_ACTIVE_BLOCK":
      return {
        ...state,
        activeBlocks: state.activeBlocks.filter((blockId) => blockId !== action.payload),
      };
    case "ADD_ANSWERED_QUESTION":
      return {
        ...state,
        answeredQuestions: new Set(state.answeredQuestions).add(action.payload),
      };
    case "ADD_NAVIGATION_HISTORY":
      return {
        ...state,
        navigationHistory: [...state.navigationHistory, action.payload],
      };
    case "CREATE_DYNAMIC_BLOCK":
      return {
        ...state,
        dynamicBlocks: [...state.dynamicBlocks, action.payload],
      };
    case "DELETE_DYNAMIC_BLOCK":
      return {
        ...state,
        dynamicBlocks: state.dynamicBlocks.filter((block) => block.block_id !== action.payload),
      };
    case "ADD_BLOCK_ACTIVATION": {
      const { blockId, source } = action.payload;
      return {
        ...state,
        blockActivations: {
          ...state.blockActivations,
          [blockId]: [...(state.blockActivations[blockId] || []), source],
        },
      };
    }
    case "DELETE_QUESTION_RESPONSES": {
      const questionIdsToDelete = action.payload;
      const updatedResponses = { ...state.responses };

      questionIdsToDelete.forEach((questionId) => {
        delete updatedResponses[questionId];
      });

      const updatedAnsweredQuestions = new Set(
        [...state.answeredQuestions].filter((questionId) => !questionIdsToDelete.includes(questionId))
      );

      return {
        ...state,
        responses: updatedResponses,
        answeredQuestions: updatedAnsweredQuestions,
      };
    }
    case "MARK_BLOCK_COMPLETED":
      return {
        ...state,
        completedBlocks: [...state.completedBlocks, action.payload],
      };
    case "REMOVE_BLOCK_FROM_COMPLETED":
      return {
        ...state,
        completedBlocks: state.completedBlocks.filter((blockId) => blockId !== action.payload),
      };
    case "ADD_PENDING_REMOVAL":
      return {
        ...state,
        pendingRemovals: [...state.pendingRemovals, action.payload],
      };
    case "REMOVE_PENDING_REMOVAL":
      return {
        ...state,
        pendingRemovals: state.pendingRemovals.filter((removal) => removal.questionId !== action.payload),
      };
    default:
      return state;
  }
}

type FormProviderProps = {
  children: React.ReactNode;
};

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [state, dispatch] = useReducer(formReducer, initialState);

  const goToQuestion = (block_id: string, question_id: string, skipNavigation: boolean = false) => {
    if (!skipNavigation) {
      // Add navigation history entry
      const navHistory: NavigationHistory = {
        from_block_id: state.activeQuestion.block_id,
        from_question_id: state.activeQuestion.question_id,
        to_block_id: block_id,
        to_question_id: question_id,
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_NAVIGATION_HISTORY", payload: navHistory });
    }

    dispatch({
      type: "SET_ACTIVE_QUESTION",
      payload: { block_id, question_id },
    });
  };

  const setResponse = (question_id: string, placeholder_key: string, value: string | string[]) => {
    dispatch({
      type: "SET_RESPONSE",
      payload: { question_id, placeholder_key, value },
    });
    dispatch({ type: "ADD_ANSWERED_QUESTION", payload: question_id });
  };

  const setNavigating = (isNavigating: boolean) => {
    dispatch({ type: "SET_NAVIGATION", payload: isNavigating });
  };

  const setBackNavigation = (isBack: boolean) => {
    dispatch({ type: "SET_BACK_NAVIGATION", payload: isBack });
  };

  const addActiveBlock = (blockId: string) => {
    if (!state.activeBlocks.includes(blockId)) {
      dispatch({ type: "ADD_ACTIVE_BLOCK", payload: blockId });
    }
  };

  const removeActiveBlock = (blockId: string) => {
    dispatch({ type: "REMOVE_ACTIVE_BLOCK", payload: blockId });
  };

  const addAnsweredQuestion = (questionId: string) => {
    dispatch({ type: "ADD_ANSWERED_QUESTION", payload: questionId });
  };

  const navigateToNextQuestion = (questionId: string, leadsTo: string) => {
    // Find the current block
    const currentBlock = blocks.find((block) =>
      block.questions.some((question) => question.question_id === questionId)
    );

    if (!currentBlock) {
      console.error("Current block not found");
      return;
    }

    // Find the index of the current question in the block
    const currentQuestionIndex = currentBlock.questions.findIndex(
      (question) => question.question_id === questionId
    );

    if (currentQuestionIndex === -1) {
      console.error("Current question not found in the block");
      return;
    }

    if (leadsTo === "next_block") {
      // Find the index of the current block
      const currentBlockIndex = blocks.findIndex((block) => block.block_id === currentBlock.block_id);

      if (currentBlockIndex === -1) {
        console.error("Current block not found in blocks array");
        return;
      }

      // Go to the next block if it exists
      if (currentBlockIndex < blocks.length - 1) {
        const nextBlock = blocks[currentBlockIndex + 1];
        goToQuestion(nextBlock.block_id, nextBlock.questions[0].question_id);
      } else {
        console.warn("This was the last block");
        return;
      }
    } else {
      // Find the next question based on leadsTo
      const nextQuestion = currentBlock.questions.find((question) => question.question_id === leadsTo);

      if (nextQuestion) {
        goToQuestion(currentBlock.block_id, nextQuestion.question_id);
      } else {
        console.error("Next question not found");
      }
    }
  };

  const createDynamicBlock = (blockBlueprintId: string): string => {
    const blueprint = blocks.find((block) => block.block_id === blockBlueprintId);

    if (!blueprint) {
      console.error(`Blueprint with id ${blockBlueprintId} not found`);
      throw new Error(`Blueprint with id ${blockBlueprintId} not found`);
    }

    const newBlockId = `${blueprint.block_id}-${uuidv4()}`;
    const copyNumber =
      state.dynamicBlocks.filter((block) => block.blueprint_id?.startsWith(blockBlueprintId)).length + 1;

    const newBlock: Block = {
      ...blueprint,
      block_id: newBlockId,
      blueprint_id: blueprint.block_id.includes("{copyNumber}")
        ? blueprint.block_id.replace("{copyNumber}", copyNumber.toString())
        : blueprint.block_id,
      copy_number: copyNumber,
      questions: blueprint.questions.map((question) => ({
        ...question,
        question_id: `${question.question_id}-${uuidv4()}`,
      })),
    };

    dispatch({ type: "CREATE_DYNAMIC_BLOCK", payload: newBlock });
    return newBlockId;
  };

  const deleteDynamicBlock = (blockId: string): boolean => {
    const blockToDelete = state.dynamicBlocks.find((block) => block.block_id === blockId);

    if (!blockToDelete) {
      console.error(`Block with id ${blockId} not found`);
      return false;
    }

    // Remove all responses associated with questions in the block
    const questionIdsToDelete = blockToDelete.questions.map((question) => question.question_id);
    deleteQuestionResponses(questionIdsToDelete);

    dispatch({ type: "DELETE_DYNAMIC_BLOCK", payload: blockId });
    return true;
  };

  const deleteQuestionResponses = (questionIds: string[]) => {
    dispatch({ type: "DELETE_QUESTION_RESPONSES", payload: questionIds });
  };

  const isBlockCompleted = (blockId: string): boolean => {
    return state.completedBlocks.includes(blockId);
  };

  const markBlockAsCompleted = (blockId: string): void => {
    dispatch({ type: "MARK_BLOCK_COMPLETED", payload: blockId });
  };

  const removeBlockFromCompleted = (blockId: string): void => {
    dispatch({ type: "REMOVE_BLOCK_FROM_COMPLETED", payload: blockId });
  };

  const addPendingRemoval = (questionId: string, blockId: string): void => {
    const pendingRemoval: PendingRemoval = {
      questionId: questionId,
      blockId: blockId,
      timestamp: Date.now(),
    };
    dispatch({ type: "ADD_PENDING_REMOVAL", payload: pendingRemoval });
  };

  const removePendingRemoval = (questionId: string): void => {
    dispatch({ type: "REMOVE_PENDING_REMOVAL", payload: questionId });
  };

  const contextValue = {
    state,
    blocks,
    goToQuestion,
    setResponse,
    setNavigating,
    setBackNavigation,
    addActiveBlock,
    removeActiveBlock,
    addAnsweredQuestion,
    navigateToNextQuestion,
    createDynamicBlock,
    deleteDynamicBlock,
    deleteQuestionResponses,
    isBlockCompleted,
    markBlockAsCompleted,
    removeBlockFromCompleted,
    addPendingRemoval,
    removePendingRemoval,
  };

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
};

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};
