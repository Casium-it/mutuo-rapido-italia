import { Block } from "@/types/form";

// Block 6 - Reddito secondario
export const block6: Block = {
  block_number: "6",
  block_id: "reddito_secondario",
  title: "Reddito secondario",
  priority: 1000, // Priorità aggiunta
  default_active: true,
  questions: [
    {
      question_number: "6.1",
      question_id: "presenza_reddito_secondario",
      question_text: "{{placeholder1}} reddito aggiuntivo oltre al principale già dichiarato",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "percepisco", label: "Percepisco", leads_to: "next_block", add_repeatinggroupblock: "manager_reddito_secondario"},
            { id: "non_percepisco", label: "Non percepisco", leads_to: "next_block" }
          ]
        }
      }
    }
  ]
};
