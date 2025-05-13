
import { Block } from "@/types/form";

// Block 22 - Cointestatario
export const block22: Block = {
  block_number: "22",
  block_id: "cointestatario",
  title: "Il tuo cointestatario",
  default_active: false,
  questions: [
    {
      question_number: "22.1",
      question_id: "cointestatario_dati",
      question_text: "Il cointestatario ha {{placeholder1}} anni",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Età",
          leads_to: "next_block"
        }
      }
    }
  ]
};
