
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

export type InputPlaceholder = {
  type: "input";
  input_type: "text" | "number" | "date";
  placeholder_label: string;
  leads_to?: string;
};

export type Placeholder = SelectPlaceholder | InputPlaceholder;

export type Question = {
  question_id: string;
  question_number: string;
  question_text: string;
  block_id?: string; // Aggiunto il campo block_id per risolvere l'errore
  inline?: boolean;
  leads_to_placeholder_priority: string; // Nuovo campo obbligatorio per definire quale placeholder ha priorità per la navigazione
  placeholders: Record<string, Placeholder>;
};

export type Block = {
  block_number: string;
  block_id: string;
  title: string;
  priority: number; // Nuovo campo per definire la priorità del blocco
  default_active?: boolean;
  questions: Question[];
};

export type FormResponse = {
  [question_id: string]: {
    [placeholder_key: string]: string | string[];
  };
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
};
