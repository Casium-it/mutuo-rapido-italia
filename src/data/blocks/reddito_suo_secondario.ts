
import { Block } from "@/types/form";

export const reddito_suo_secondario: Block = {
  block_number: "12",
  block_id: "reddito_suo_secondario",
  title: "Reddito suo secondario",
  priority: 2000,
  default_active: false,
  questions: [
    {
      question_number: "12.1",
      question_id: "presenza_reddito_suo_secondario",
      question_text: "{{placeholder1}} reddito aggiuntivo oltre al principale già dichiarato",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "percepisce", label: "Percepisce", leads_to: "manager_reddito_suo_secondario" },
            { id: "non_percepisce", label: "Non percepisce", leads_to: "next_block" }
          ]
        }
      }
    },
    {
      question_number: "12.2",
      question_id: "manager_reddito_suo_secondario",
      question_text: "Aggiungi qui tutte le fonti di reddito secondarie",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "MultiBlockManager",
          placeholder_label: "",
          add_block_label: "Aggiungi reddito",
          blockBlueprint: "reddito_suo_secondario_blueprint{copyNumber}",
          leads_to: "next_block"
        }
      }
    }
  ]
};
