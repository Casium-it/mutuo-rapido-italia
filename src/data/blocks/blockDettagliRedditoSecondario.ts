
import { Block } from "@/types/form";

// Dettagli Reddito Secondario - blueprint for dynamic blocks
export const blockDettagliRedditoSecondario: Block = {
  block_number: "6D",
  block_id: "dettagli_reddito_secondario_{copyNumber}",
  title: "Dettagli reddito secondario",
  priority: 61,
  multiBlock: true, // Mark as multiBlock blueprint
  questions: [
    {
      question_number: "6D.1",
      question_id: "media_reddito_secondario_{copyNumber}",
      question_text: "Negli ultimi 3 anni di media ho ricevuto {{placeholder1}} euro",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_reddito_secondario_{copyNumber}",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "6D.2",
      question_id: "frequenza_reddito_secondario_{copyNumber}",
      question_text: "{{placeholder1}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensile", label: "mensilmente", leads_to: "lordo_netto_reddito_secondario_{copyNumber}" },
            { id: "annuale", label: "annualmente", leads_to: "lordo_netto_reddito_secondario_{copyNumber}" }
          ]
        }
      }
    },
    {
      question_number: "6D.3",
      question_id: "lordo_netto_reddito_secondario_{copyNumber}",
      question_text: "{{placeholder1}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "netto", label: "netti", leads_to: "stabilita_reddito_secondario_{copyNumber}" },
            { id: "lordo", label: "lordi", leads_to: "stabilita_reddito_secondario_{copyNumber}" }
          ]
        }
      }
    },
    {
      question_number: "6D.4",
      question_id: "stabilita_reddito_secondario_{copyNumber}",
      question_text: "Ritengo questa entrata {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "volatile", label: "volatile", leads_to: "data_inizio_reddito_{copyNumber}" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "data_inizio_reddito_{copyNumber}" },
            { id: "quasi_garantita", label: "quasi garantita", leads_to: "data_inizio_reddito_{copyNumber}" },
            { id: "vincolata", label: "vincolata e sicura", leads_to: "data_inizio_reddito_{copyNumber}" }
          ]
        }
      }
    },
    {
      question_number: "6D.5",
      question_id: "data_inizio_reddito_{copyNumber}",
      question_text: "Ricevo questa entrata dal {{placeholder1}} / {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Mese",
          leads_to: "data_fine_reddito_{copyNumber}",
          input_validation: "month"
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          leads_to: "data_fine_reddito_{copyNumber}",
          input_validation: "year"
        }
      }
    },
    {
      question_number: "6D.6",
      question_id: "data_fine_reddito_{copyNumber}",
      question_text: "e continuerò a riceverla sicuramente fino al {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Anno o 'non lo so'",
          leads_to: "torna_alla_gestione_redditi",
          input_validation: "free_text"
        }
      }
    },
    {
      question_number: "6D.7",
      question_id: "torna_alla_gestione_redditi",
      question_text: "Hai completato i dettagli per questo reddito secondario",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "torna_indietro", label: "Torna alla gestione redditi", leads_to: "tipo_reddito_secondario" }
          ]
        }
      }
    }
  ]
};
