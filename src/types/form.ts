
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
  placeholder_label?: string; // Aggiungiamo questa proprietà
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
  question_notes?: string;
};

// Nuovo tipo per le domande del sottoflusso nei gruppi ripetuti
export type SubflowQuestion = Question;

// Definizione del blocco repeating_group
export type RepeatingGroupBlock = {
  block_number: string;
  block_id: string;
  title: string;
  priority: number;
  default_active?: boolean;
  type: "repeating_group";
  repeating_id: string;
  subflow: SubflowQuestion[];
  // New optional fields for customizable text elements
  subtitle?: string;
  empty_state_text?: string;
  add_button_text?: string;
  continue_button_text?: string;
};

// Definizione regolare del blocco standard
export type StandardBlock = {
  block_number: string;
  block_id: string;
  title: string;
  priority: number;
  default_active?: boolean;
  questions: Question[];
};

// Union type per supportare sia blocchi standard che repeating_group
export type Block = StandardBlock | RepeatingGroupBlock;

// Tipo per un singolo record di entrata in un gruppo ripetuto
export type RepeatingGroupEntry = {
  id?: string;
  [key: string]: any;
};

// Tipo per l'elenco di record in un gruppo ripetuto
export type RepeatingGroupEntries = {
  [repeating_id: string]: RepeatingGroupEntry[];
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
  repeatingGroups?: RepeatingGroupEntries; // Aggiungiamo supporto per i gruppi ripetuti nello stato
};
