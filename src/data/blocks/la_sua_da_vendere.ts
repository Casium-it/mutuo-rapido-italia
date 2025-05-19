
import { Block } from "@/types/form";

export const la_sua_da_vendere: Block = {
  block_number: "14",
  block_id: "la_sua_da_vendere",
  title: "La sua casa da vendere",
  priority: 2400,
  default_active: false,
  questions: [
    {
      question_number: "14.1",
      question_id: "la_sua_da_vendere_domanda",
      question_text: "Informazioni sulla casa da vendere",
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
