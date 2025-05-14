import { Block } from "@/types/form";

// Block 8 - La tua casa
export const block8: Block = {
  block_number: "8",
  block_id: "la_tua_casa",
  title: "La tua casa",
  priority: 80, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "8.1",
      question_id: "offerta_casa",
      question_text: "L'offerta della casa individuata è di {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Valore offerta",
          leads_to: "classe_energetica",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "8.2",
      question_id: "classe_energetica",
      question_text: "La casa è una classe energetica {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "classe_a", label: "A", leads_to: "agenzia_intermediaria" },
            { id: "classe_b", label: "B", leads_to: "agenzia_intermediaria" },
            { id: "classe_c", label: "C", leads_to: "agenzia_intermediaria" },
            { id: "classe_d", label: "D", leads_to: "agenzia_intermediaria" },
            { id: "classe_e_f_g", label: "E,F,G...", leads_to: "agenzia_intermediaria" },
            { id: "classe_non_so", label: "non lo so", leads_to: "agenzia_intermediaria" }
          ]
        }
      }
    },
    {
      question_number: "8.3",
      question_id: "agenzia_intermediaria",
      question_text: "L'acquisto {{placeholder1}} un'agenzia immobiliare intermediaria",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "ha", label: "ha", leads_to: "costo_agenzia" },
            { id: "non_ha", label: "non ha", leads_to: "next_block" }
          ]
        }
      }
    },
    {
      question_number: "8.4",
      question_id: "costo_agenzia",
      question_text: "che costerà circa {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Costo agenzia",
          leads_to: "next_block",
          input_validation: "euro"
        }
      }
    }
  ]
};
