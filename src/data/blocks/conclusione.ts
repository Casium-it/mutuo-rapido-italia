
import { Block } from "@/types/form";

export const conclusione: Block = {
  block_number: "20",
  block_id: "conclusione",
  title: "Conclusione",
  priority: 2500,
  default_active: false,
  questions: [
    {
      question_number: "20.1",
      question_id: "conclusione_domanda",
      question_text: "Grazie per aver completato il form",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "fine", label: "Concludi", leads_to: "next_block" }
          ]
        }
      }
    }
  ]
};
