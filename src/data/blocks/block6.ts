
import { Block } from "@/types/form";

// Block 6 - Reddito secondario
export const block6: Block = {
  block_number: "6",
  block_id: "reddito_secondario",
  title: "Reddito secondario",
  priority: 60, // Priorità aggiunta
  default_active: true,
  questions: [
    {
      question_number: "6.1",
      question_id: "presenza_reddito_secondario",
      question_text: "Negli ultimi anni {{placeholder1}} reddito aggiuntivo oltre al principale dichiarato",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "ricevo", label: "ricevo", leads_to: "gestione_redditi_secondari" },
            { id: "non_ricevo", label: "non ricevo", leads_to: "next_block" }
          ]
        }
      }
    },
    // Nuova domanda con sub-blocks
    {
      question_number: "6.2",
      question_id: "gestione_redditi_secondari",
      question_text: "Di seguito puoi aggiungere tutti i redditi secondari che ricevi",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "sub-blocks",
          placeholder_label: "Redditi aggiuntivi",
          add_block_label: "Aggiungi un altro reddito",
          create_block_copy: "reddito_secondario_dettagli",
          leads_to: "next_block" // Porta al prossimo blocco non invisibile quando l'utente ha finito
        }
      }
    }
  ]
};
