
import { Block } from "@/types/form";

export const la_sua_professione: Block = {
  block_number: "9",
  block_id: "la_sua_professione",
  title: "La sua professione",
  priority: 1700,
  default_active: false,
  questions: [
    {
      question_number: "9.1",
      question_id: "la_sua_professione_domanda",
      question_text: "Informazioni sulla professione",
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
