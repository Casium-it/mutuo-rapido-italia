
import { Block } from "@/types/form";

export const cointestatario: Block = {
  block_number: "8",
  block_id: "cointestatario",
  title: "Cointestatario",
  priority: 1600,
  default_active: false,
  questions: [
    {
      question_number: "8.1",
      question_id: "cointestatario_domanda",
      question_text: "Informazioni sul cointestatario",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "continua", label: "Continua", leads_to: "next_block" }
          ]
        }
      }
    }
  ]
};
