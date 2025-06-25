
import { Block } from "@/types/form";

export const finanziamenti: Block = {
  block_number: "7",
  block_id: "finanziamenti",
  title: "I tuoi finanziamenti",
  priority: 1050,
  default_active: true,
  questions: [
    {
      question_number: "7.1",
      question_id: "presenza_finanziamenti",
      question_text: "Ad oggi {{placeholder1}} finanziamenti aperti",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "ho",
              label: "ho",
              leads_to: "manager_finanziamenti"
            },
            {
              id: "non_ho",
              label: "non ho",
              leads_to: "next_block"
            }
          ]
        }
      }
    },
    {
      question_number: "7.2",
      question_id: "manager_finanziamenti",
      question_text: "Aggiungi qui tutte i finanziamenti attualmente aperti",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "MultiBlockManager",
          placeholder_label: "",
          add_block_label: "Aggiungi finanziamento",
          blockBlueprint: "finanziamenti_blueprint{copyNumber}",
          leads_to: "next_block"
        }
      }
    }
  ]
};
