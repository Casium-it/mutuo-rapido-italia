
import { Block } from "@/types/form";

export const i_suoi_finanziamenti: Block = {
  block_number: "13",
  block_id: "i_suoi_finanziamenti",
  title: "I suoi finanziamenti",
  priority: 2200,
  default_active: false,
  questions: [
    {
      question_number: "13.1",
      question_id: "presenza_suoi_finanziamenti",
      question_text: "Ad oggi {{placeholder1}} finanziamenti aperti",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "ha",
              label: "ha",
              leads_to: "manager_suoi_finanziamenti"
            },
            {
              id: "non_ha",
              label: "non ha",
              leads_to: "next_block"
            }
          ]
        }
      }
    },
    {
      question_number: "13.2",
      question_id: "manager_suoi_finanziamenti",
      question_text: "Aggiungi qui tutti i finanziamenti attualmente aperti",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "MultiBlockManager",
          placeholder_label: "",
          add_block_label: "Aggiungi finanziamento",
          blockBlueprint: "i_suoi_finanziamenti_blueprint{copyNumber}",
          leads_to: "next_block"
        }
      }
    }
  ]
};
