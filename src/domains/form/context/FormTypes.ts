
import { Block, Question, FormResponse, NavigationHistory, Placeholder, SelectPlaceholder } from "@/types/form";

// Tipo che rappresenta la fonte di attivazione di un blocco
export type BlockActivationSource = {
  questionId: string;
  placeholderId: string;
};

// Stato principale del form
export type FormState = {
  activeBlocks: string[];
  activeQuestion: {
    block_id: string;
    question_id: string;
  };
  responses: FormResponse;
  answeredQuestions: Set<string>;
  isNavigating?: boolean;
  navigationHistory: NavigationHistory[];
  dynamicBlocks: Block[];
  blockActivations: Record<string, BlockActivationSource[]>; // Traccia quali domande hanno attivato quali blocchi
  completedBlocks: string[]; // Traccia i blocchi completati
};

// Azioni per il reducer
export type FormAction =
  | { type: "GO_TO_QUESTION"; block_id: string; question_id: string }
  | { type: "SET_RESPONSE"; question_id: string; placeholder_key: string; value: string | string[]; previousBlockAdded?: string }
  | { type: "ADD_ACTIVE_BLOCK"; block_id: string; sourceQuestionId?: string; sourcePlaceholderId?: string }
  | { type: "REMOVE_ACTIVE_BLOCK"; block_id: string }
  | { type: "MARK_QUESTION_ANSWERED"; question_id: string }
  | { type: "SET_FORM_STATE"; state: Partial<FormState> }
  | { type: "RESET_FORM" }
  | { type: "SET_NAVIGATING"; isNavigating: boolean }
  | { type: "ADD_NAVIGATION_HISTORY"; history: NavigationHistory }
  | { type: "ADD_DYNAMIC_BLOCK"; block: Block }
  | { type: "DELETE_DYNAMIC_BLOCK"; blockId: string }
  | { type: "DELETE_QUESTION_RESPONSES"; questionIds: string[] }
  | { type: "MARK_BLOCK_COMPLETED"; blockId: string }
  | { type: "REMOVE_BLOCK_FROM_COMPLETED"; blockId: string };

// API esposta dal context
export interface FormContextType {
  state: FormState;
  blocks: Block[];
  goToQuestion: (block_id: string, question_id: string, replace?: boolean) => void;
  setResponse: (question_id: string, placeholder_key: string, value: string | string[]) => void;
  getResponse: (question_id: string, placeholder_key: string) => string | string[] | undefined;
  addActiveBlock: (block_id: string) => void;
  removeActiveBlock: (block_id: string) => void;
  isQuestionAnswered: (question_id: string) => boolean;
  navigateToNextQuestion: (currentQuestionId: string, leadsTo: string) => void;
  getProgress: () => number;
  resetForm: () => void;
  getNavigationHistoryFor: (questionId: string) => NavigationHistory | undefined;
  createDynamicBlock: (blockBlueprintId: string) => string | null;
  deleteDynamicBlock: (blockId: string) => boolean;
  deleteQuestionResponses: (questionIds: string[]) => void;
  isBlockCompleted: (blockId: string) => boolean;
  markBlockAsCompleted: (blockId: string) => void;
}
