
import { Block } from "@/types/form";

// Block 99 - Stop Flow
export const blockStop: Block = {
  block_number: "99",
  block_id: "stop_flow",
  title: "Interruzione percorso / Surroga",
  priority: 999, // Priorità alta per mantenerlo alla fine
  default_active: false,
  questions: [
    {
      question_number: "99.1",
      question_id: "stop_flow_entry",
      question_text: "Al momento la funzionalità di surroga non è disponibile. {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "torna_inizio", label: "Torna all'inizio", leads_to: "fase_mutuo" }
          ]
        }
      }
    }
  ]
};
