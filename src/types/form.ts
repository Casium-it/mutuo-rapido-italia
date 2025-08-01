
export type PlaceholderOption = {
  id: string;
  label: string;
  leads_to: string;
  add_block?: string;
};

export type SelectPlaceholder = {
  type: "select";
  options: PlaceholderOption[];
  multiple?: boolean;
  placeholder_label?: string;
};

export type ValidationTypes = "euro" | "month" | "year" | "age" | "city" | "cap" | "free_text";

export type InputPlaceholder = {
  type: "input";
  input_type: "text" | "number" | "date";
  placeholder_label: string;
  leads_to?: string;
  input_validation: ValidationTypes;
};

export type MultiBlockManagerPlaceholder = {
  type: "MultiBlockManager";
  placeholder_label: string;
  add_block_label: string;
  blockBlueprint: string;
  leads_to: string;
};

export type Placeholder = SelectPlaceholder | InputPlaceholder | MultiBlockManagerPlaceholder;

export type Question = {
  question_id: string;
  question_number: string;
  question_text: string;
  question_notes?: string;
  block_id?: string;
  inline?: boolean;
  endOfForm?: boolean; // End-of-form question attribute
  skippableWithNotSure?: boolean; // Nuovo attributo che indica se la domanda può essere saltata con "non lo so"
  leads_to_placeholder_priority: string;
  placeholders: Record<string, Placeholder>;
};

export type Block = {
  block_number: string;
  block_id: string;
  title: string;
  priority: number;
  default_active?: boolean;
  invisible?: boolean;
  multiBlock?: boolean;
  blueprint_id?: string;
  copy_number?: number;
  questions: Question[];
};

export type FormResponse = {
  [question_id: string]: {
    [placeholder_key: string]: string | string[];
  };
};

export type NavigationHistory = {
  from_block_id: string;
  from_question_id: string;
  to_block_id: string;
  to_question_id: string;
  timestamp: number;
};

export type BlockActivationSource = {
  questionId: string;
  placeholderId: string;
};

export type PendingRemoval = {
  questionId: string;
  blockId: string;
  timestamp: number;
};

export type SessionType = 'new' | 'resumed';

export type FormState = {
  simulationId: string; // Unique identifier for this simulation session
  sessionType: SessionType; // Whether this is a new simulation or resumed one
  formSlug?: string; // Form slug for this simulation
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
  blockActivations: Record<string, BlockActivationSource[]>; // Track which questions activated which blocks
  completedBlocks: string[]; // Track completed blocks
  pendingRemovals: PendingRemoval[]; // Track questions pending removal
};
