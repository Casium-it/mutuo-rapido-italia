
import { Block } from "@/types/form";

export const reddito_suo_secondario_blueprint: Block = {
  block_number: "12",
  block_id: "reddito_suo_secondario_blueprint{copyNumber}",
  title: "Reddito secondario",
  priority: 2100,
  multiBlock: true,
  invisible: true,
  questions: [
    {
      question_number: "12.3.1",
      question_id: "tipo_reddito_secondario{copyNumber}",
      question_text: "Informazioni sul reddito secondario",
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
