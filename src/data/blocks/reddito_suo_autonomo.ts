
import { Block } from "@/types/form";

export const reddito_suo_autonomo: Block = {
  block_number: "10",
  block_id: "reddito_suo_autonomo",
  title: "Reddito suo autonomo",
  priority: 1800,
  default_active: false,
  questions: [
    {
      question_number: "10.1",
      question_id: "reddito_suo_autonomo_domanda",
      question_text: "Informazioni sul reddito autonomo",
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
