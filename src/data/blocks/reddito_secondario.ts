
import { Block } from "@/types/form";

export const reddito_secondario: Block = {
  block_number: "6",
  block_id: "reddito_secondario",
  title: "Reddito secondario",
  priority: 1000,
  default_active: true,
  questions: [
    {
      question_number: "6.1",
      question_id: "presenza_reddito_secondario",
      question_text: "{{placeholder1}} reddito aggiuntivo oltre al principale già dichiarato",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "percepisco", label: "Percepisco", leads_to: "manager_reddito_secondario" },
            { id: "non_percepisco", label: "Non percepisco", leads_to: "next_block" }
          ]
        }
      }
    },
    {
      question_number: "6.2",
      question_id: "manager_reddito_secondario",
      question_text: "Aggiungi qui tutte le tue fonti di reddito secondarie",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "MultiBlockManager",
          placeholder_label: "",
          add_block_label: "Aggiungi reddito",
          blockBlueprint: "reddito_secondario_blueprint{copyNumber}",
          leads_to: "next_block"
        }
      }
    }
  ]
};
