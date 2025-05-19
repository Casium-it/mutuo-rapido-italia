
import { Block } from "@/types/form";

export const reddito_suo_principale: Block = {
  block_number: "11",
  block_id: "reddito_suo_principale",
  title: "Reddito suo principale",
  priority: 1900,
  default_active: false,
  questions: [
    {
      question_number: "11.1",
      question_id: "reddito_suo_principale_domanda",
      question_text: "Informazioni sul reddito principale",
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
