
import { Block } from "@/types/form";

// Block 0 - Funnel iniziale
export const block0: Block = {
  block_number: "0",
  block_id: "funnel",
  title: "Domanda iniziale",
  default_active: true,
  questions: [
    {
      question_number: "0.1",
      question_id: "fase_mutuo",
      question_text: "A che punto del Mutuo sei? {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "pensiero", label: "Sto pensando di comprare", leads_to: "soggetto_acquisto"},
            { id: "ricerca", label: "Sto cercando casa", leads_to: "soggetto_acquisto"},
            { id: "offerta", label: "Ho fatto un'offerta", leads_to: "soggetto_acquisto", add_block: "la_tua_casa" },
            { id: "accettata", label: "Ho un'offerta accettata", leads_to: "soggetto_acquisto", add_block: "la_tua_casa" },
            { id: "surroga", label: "Ho bisogno di una surroga", leads_to: "stop_flow_entry", add_block: "stop_flow" }
          ]
        }
      }
    }
  ]
};
