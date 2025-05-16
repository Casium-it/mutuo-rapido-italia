
import { Block } from "@/types/form";

// Block 26 - Reddito secondario del cointestatario
export const block26: Block = {
  block_number: "26",
  block_id: "reddito_suo_secondario",
  title: "Il suo reddito secondario",
  priority: 76, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "26.1",
      question_id: "presenza_reddito_secondario_coint",
      question_text: "Negli ultimi anni {{placeholder1}} reddito aggiuntivo oltre al principale dichiarato",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "ha_ricevuto", "label": "ha ricevuto", "leads_to": "gestione_redditi_secondari_coint"},
            {"id": "non_ha_ricevuto", "label": "non ha ricevuto", "leads_to": "next_block"}
          ]
        }
      }
    },
    // Nuova domanda con sub-blocks
    {
      question_number: "26.2",
      question_id: "gestione_redditi_secondari_coint",
      question_text: "Di seguito puoi aggiungere tutti i redditi secondari che riceve",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "sub-blocks",
          placeholder_label: "Redditi aggiuntivi",
          add_block_label: "Aggiungi un altro reddito",
          create_block_copy: "reddito_secondario_dettagli_coint",
          leads_to: "next_block"
        }
      }
    }
  ]
};
