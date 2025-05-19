import { Block } from "@/types/form";

// Block 26 - Reddito secondario del cointestatario
export const reddito_suo_secondario: Block = {
  block_number: "26",
  block_id: "reddito_suo_secondario",
  title: "Il suo reddito secondario",
  priority: 1400, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "26.1",
      question_id: "presenza_reddito_secondario",
      question_text: "Il tuo cointestatario{{placeholder1}} reddito aggiuntivo oltre al principale già dichiarato",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "percepisce", label: "percepisce", leads_to: "next_block", add_block: "manager_reddito_secondario_coint"},
            { id: "non_percepisce", label: "non percepisce", leads_to: "next_block" }
          ]
        }
      }
    }
  ]
};
