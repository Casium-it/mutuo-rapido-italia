
import { Block, FormState, FormResponse, NavigationHistory } from "@/types/form";

export const initialState: FormState = {
  activeBlocks: [],
  activeQuestion: {
    block_id: "introduzione",
    question_id: "soggetto_acquisto"
  },
  responses: {},
  answeredQuestions: new Set(),
  isNavigating: false,
  navigationHistory: [],
  dynamicBlocks: [],
  blockActivations: {} // Track which questions/placeholders activated which blocks
};

export const createInitialState = (blocks: Block[]): FormState => {
  const sortedBlocks = [...blocks].sort((a, b) => a.priority - b.priority);
  
  return {
    ...initialState,
    activeBlocks: sortedBlocks.filter(b => b.default_active).map(b => b.block_id),
    dynamicBlocks: [],
    blockActivations: {}
  };
};
