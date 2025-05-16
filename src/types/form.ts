
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

export type Placeholder = SelectPlaceholder | InputPlaceholder;

export type Question = {
  question_id: string;
  question_number: string;
  question_text: string;
  block_id?: string;
  inline?: boolean;
  leads_to_placeholder_priority: string;
  placeholders: Record<string, Placeholder>;
  repeatable?: boolean; // Nuovo attributo per domande ripetibili
};

export type Block = {
  block_number: string;
  block_id: string;
  title: string;
  priority: number;
  default_active?: boolean;
  questions: Question[];
  repeatable?: boolean; // Nuovo attributo per blocchi ripetibili
};

// Modifica alla struttura per supportare più iterazioni della stessa domanda
export type FormResponse = {
  [question_id: string]: {
    // Le iterazioni delle risposte per questa domanda
    iterations: Array<{
      iteration_id: number;
      responses: {
        [placeholder_key: string]: string | string[];
      };
    }>;
    // Manteniamo anche le risposte dirette per retrocompatibilità
    [placeholder_key: string]: string | string[] | any;
  };
};

export type NavigationHistory = {
  from_block_id: string;
  from_question_id: string;
  to_block_id: string;
  to_question_id: string;
  timestamp: number;
  iteration_id?: number; // Nuovo campo per tracciare l'iterazione
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
  currentIterations: {  // Nuovo campo per tenere traccia delle iterazioni correnti
    [question_id: string]: number;
  };
};
