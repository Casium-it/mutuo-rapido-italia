
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Block, FormState, FormResponse } from "@/types/form";

type FormContextType = {
  state: FormState;
  blocks: Block[];
  goToQuestion: (block_id: string, question_id: string) => void;
  setResponse: (question_id: string, placeholder_key: string, value: string | string[]) => void;
  getResponse: (question_id: string, placeholder_key: string) => string | string[] | undefined;
  addActiveBlock: (block_id: string) => void;
  isQuestionAnswered: (question_id: string) => boolean;
  navigateToNextQuestion: (currentQuestionId: string, leadsTo: string) => void;
};

type Action =
  | { type: "GO_TO_QUESTION"; block_id: string; question_id: string }
  | { type: "SET_RESPONSE"; question_id: string; placeholder_key: string; value: string | string[] }
  | { type: "ADD_ACTIVE_BLOCK"; block_id: string }
  | { type: "MARK_QUESTION_ANSWERED"; question_id: string };

const initialState: FormState = {
  activeBlocks: [],
  activeQuestion: {
    block_id: "funnel",
    question_id: "fase_mutuo"
  },
  responses: {},
  answeredQuestions: new Set()
};

const FormContext = createContext<FormContextType | undefined>(undefined);

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "GO_TO_QUESTION":
      return {
        ...state,
        activeQuestion: {
          block_id: action.block_id,
          question_id: action.question_id
        }
      };
    case "SET_RESPONSE": {
      const newResponses = { ...state.responses };
      if (!newResponses[action.question_id]) {
        newResponses[action.question_id] = {};
      }
      newResponses[action.question_id][action.placeholder_key] = action.value;
      return {
        ...state,
        responses: newResponses
      };
    }
    case "ADD_ACTIVE_BLOCK": {
      if (state.activeBlocks.includes(action.block_id)) {
        return state;
      }
      return {
        ...state,
        activeBlocks: [...state.activeBlocks, action.block_id]
      };
    }
    case "MARK_QUESTION_ANSWERED": {
      const answeredQuestions = new Set(state.answeredQuestions);
      answeredQuestions.add(action.question_id);
      return {
        ...state,
        answeredQuestions
      };
    }
    default:
      return state;
  }
}

export const FormProvider: React.FC<{ children: ReactNode; blocks: Block[] }> = ({ children, blocks }) => {
  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    activeBlocks: blocks.filter(b => b.default_active).map(b => b.block_id)
  });

  const goToQuestion = (block_id: string, question_id: string) => {
    dispatch({ type: "GO_TO_QUESTION", block_id, question_id });
  };

  const setResponse = (question_id: string, placeholder_key: string, value: string | string[]) => {
    dispatch({ type: "SET_RESPONSE", question_id, placeholder_key, value });
    dispatch({ type: "MARK_QUESTION_ANSWERED", question_id });
  };

  const getResponse = (question_id: string, placeholder_key: string) => {
    if (!state.responses[question_id]) return undefined;
    return state.responses[question_id][placeholder_key];
  };

  const addActiveBlock = (block_id: string) => {
    dispatch({ type: "ADD_ACTIVE_BLOCK", block_id });
  };

  const isQuestionAnswered = (question_id: string) => {
    return state.answeredQuestions.has(question_id);
  };

  const findQuestionById = (questionId: string): { block: Block; question: any } | null => {
    for (const block of blocks) {
      for (const question of block.questions) {
        if (question.question_id === questionId) {
          return { block, question };
        }
      }
    }
    return null;
  };

  const navigateToNextQuestion = (currentQuestionId: string, leadsTo: string) => {
    if (leadsTo === "next_block") {
      // Find current block and navigate to the first question of the next active block
      let currentBlockIndex = -1;
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const hasQuestion = block.questions.some(q => q.question_id === currentQuestionId);
        if (hasQuestion) {
          currentBlockIndex = i;
          break;
        }
      }

      if (currentBlockIndex !== -1) {
        // Find the next active block
        for (let i = currentBlockIndex + 1; i < blocks.length; i++) {
          const nextBlock = blocks[i];
          if (state.activeBlocks.includes(nextBlock.block_id) && nextBlock.questions.length > 0) {
            goToQuestion(nextBlock.block_id, nextBlock.questions[0].question_id);
            return;
          }
        }
      }
    } else {
      // Navigate to a specific question
      const found = findQuestionById(leadsTo);
      if (found) {
        goToQuestion(found.block.block_id, found.question.question_id);
      }
    }
  };

  return (
    <FormContext.Provider
      value={{
        state,
        blocks,
        goToQuestion,
        setResponse,
        getResponse,
        addActiveBlock,
        isQuestionAnswered,
        navigateToNextQuestion
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
