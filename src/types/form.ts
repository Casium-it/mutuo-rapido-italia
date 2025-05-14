
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
  inline?: boolean;
  block_id?: string; // Aggiunto block_id alla definizione di Question
  placeholders: Record<string, Placeholder>;
};

export type Block = {
  block_number: string;
  block_id: string;
  title: string;
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
  isNavigating?: boolean; // Added isNavigating property
};
