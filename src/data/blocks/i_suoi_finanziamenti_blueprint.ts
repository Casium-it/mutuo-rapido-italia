
import { Block } from "@/types/form";

export const i_suoi_finanziamenti_blueprint: Block = {
  block_number: "13",
  block_id: "i_suoi_finanziamenti_blueprint{copyNumber}",
  title: "Finanziamento",
  priority: 2300, 
  multiBlock: true,
  invisible: true,
  questions: [
    {
      question_number: "13.3.1",
      question_id: "tipo_finanziamento{copyNumber}",
      question_text: "Informazioni sul finanziamento",
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
