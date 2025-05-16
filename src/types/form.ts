
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
};

export type ValidationTypes = "euro" | "month" | "year" | "age" | "city" | "cap" | "free_text";

export type InputPlaceholder = {
  type: "input";
  input_type: "text" | "number" | "date";
  placeholder_label: string;
  leads_to?: string;
  input_validation: ValidationTypes;
};

export type SubBlocksPlaceholder = {
  type: "sub-blocks";
  placeholder_label?: string;
  add_block_label?: string;
  create_block_copy: string;
  leads_to?: string;
};

export type Placeholder = SelectPlaceholder | InputPlaceholder | SubBlocksPlaceholder;

export type Question = {
  question_id: string;
  question_number: string;
  question_text: string;
  block_id?: string;
  inline?: boolean;
  leads_to_placeholder_priority: string;
  placeholders: Record<string, Placeholder>;
};

export type Block = {
  block_number: string;
  block_id: string;
  title: string;
  priority: number;
  default_active?: boolean;
  invisible?: boolean; // New attribute to hide blocks from the sidebar
  is_copy_of?: string; // Nuovo campo per tracciare il blocco originale
  copy_index?: number; // Indice di copia del blocco
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

export type BlockCopyRegistry = {
  [sourceBlockId: string]: string[]; // Array of copied block IDs
};

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
  blockCopyRegistry: BlockCopyRegistry; // Registro dei blocchi copiati
};
