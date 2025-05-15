
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

export type Placeholder = SelectPlaceholder | InputPlaceholder;

export type Question = {
  question_id: string;
  question_number: string;
  question_text: string;
  block_id?: string;
  inline?: boolean;
  leads_to_placeholder_priority: string;
  placeholders: Record<string, Placeholder>;
  question_notes?: string; // Note informative sopra la domanda
  is_income_manager?: boolean; // Flag per domande di gestione reddito
  is_new_income_source?: boolean; // Flag per domande di selezione nuovo tipo reddito
  income_source_type?: string; // Tipo di reddito per domande specifiche
  income_source_details?: boolean; // Flag per domande di dettagli reddito
  is_last_income_detail?: boolean; // Flag per l'ultima domanda di dettaglio
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

export type NavigationHistory = {
  from_block_id: string;
  from_question_id: string;
  to_block_id: string;
  to_question_id: string;
  timestamp: number;
};

// Nuovo tipo per le fonti di reddito
export type IncomeSource = {
  id: string; // ID univoco per la fonte di reddito
  type: string; // Tipo di reddito (es. "affitti", "lavoro_autonomo")
  details: Record<string, any>; // Tutti i dettagli per questa fonte
  isComplete: boolean; // Se sono stati forniti tutti i dettagli obbligatori
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
  navigationHistory: NavigationHistory[]; // Cronologia di navigazione
  incomeSources: IncomeSource[]; // Nuova proprietà per le fonti di reddito
  currentIncomeSourceId?: string; // ID della fonte di reddito attualmente in modifica
};
