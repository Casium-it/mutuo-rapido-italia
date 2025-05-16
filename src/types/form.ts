
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
  input_validation: ValidationTypes; // Now required
};

// Nuovo tipo di placeholder per i sottoblocchi
export type SubblockPlaceholder = {
  type: "subblock";
  repeatable?: boolean;
  repeat_label?: string;
  leads_to: string;
  placeholder_label?: string;
  questions: Question[];
};

export type Placeholder = SelectPlaceholder | InputPlaceholder | SubblockPlaceholder;

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
  questions: Question[];
};

export type FormResponse = {
  [question_id: string]: {
    [placeholder_key: string]: string | string[];
  };
};

// Tipo per le risposte dei sottoblocchi
export type SubblockInstance = {
  instance_id: string;
  responses: FormResponse;
};

export type FormSubblockResponses = {
  [question_id: string]: {
    [placeholder_key: string]: SubblockInstance[];
  };
};

export type NavigationHistory = {
  from_block_id: string;
  from_question_id: string;
  to_block_id: string;
  to_question_id: string;
  timestamp: number;
};

export type FormState = {
  activeBlocks: string[];
  activeQuestion: {
    block_id: string;
    question_id: string;
  };
  responses: FormResponse;
  subblockResponses: FormSubblockResponses; // Aggiungiamo le risposte per i sottoblocchi
  answeredQuestions: Set<string>;
  isNavigating?: boolean;
  navigationHistory: NavigationHistory[];
  activeSubblock?: { // Stato attivo per un sottoblocco
    question_id: string;
    placeholder_key: string;
    instance_id?: string; // Se è definito, stiamo modificando un'istanza esistente
    isEditing: boolean;
  } | null;
};
