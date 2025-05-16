
import { Block } from "@/types/form";

// Blocco dettagli reddito secondario - Invisibile nella sidebar
export const block6ToCopy: Block = {
  block_number: "6.dettagli",
  block_id: "reddito_secondario_dettagli",
  title: "Dettagli reddito secondario",
  priority: 60.5, // Priorità leggermente superiore al blocco 6
  invisible: true, // Nascosto dalla sidebar
  questions: [
    {
      question_number: "6.2.1",
      question_id: "tipo_reddito_secondario",
      question_text: "Ricevo reddito aggiuntivo da {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "affitti", label: "affitti", leads_to: "media_reddito_secondario" },
            { id: "lavoro_autonomo", label: "lavoro autonomo", leads_to: "media_reddito_secondario" },
            { id: "assegno_minori", label: "assegno minori", leads_to: "media_reddito_secondario" },
            { id: "supporto_familiari", label: "supporto familiari", leads_to: "media_reddito_secondario" },
            { id: "dividendi_diritti", label: "dividendi e diritti", leads_to: "media_reddito_secondario" },
            { id: "altro", label: "altro", leads_to: "altro_descrizione" }
          ]
        }
      }
    },
    {
      question_number: "6.2.2",
      question_id: "altro_descrizione",
      question_text: "Specifica la fonte del reddito aggiuntivo",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Descrizione",
          leads_to: "media_reddito_secondario",
          input_validation: "free_text"
        }
      }
    },
    {
      question_number: "6.3",
      question_id: "media_reddito_secondario",
      question_text: "Negli ultimi 3 anni di media ho ricevuto {{placeholder1}} euro",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_reddito_secondario",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "6.4",
      question_id: "frequenza_reddito_secondario",
      question_text: "{{placeholder1}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensile", label: "mensilmente", leads_to: "lordo_netto_reddito_secondario" },
            { id: "annuale", label: "annualmente", leads_to: "lordo_netto_reddito_secondario" }
          ]
        }
      }
    },
    {
      question_number: "6.5",
      question_id: "lordo_netto_reddito_secondario",
      question_text: "{{placeholder1}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "netto", label: "netti", leads_to: "stabilita_reddito_secondario" },
            { id: "lordo", label: "lordi", leads_to: "stabilita_reddito_secondario" }
          ]
        }
      }
    },
    {
      question_number: "6.6",
      question_id: "stabilita_reddito_secondario",
      question_text: "Ritengo questa entrata {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "volatile", label: "volatile", leads_to: "data_inizio_reddito" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "data_inizio_reddito" },
            { id: "quasi_garantita", label: "quasi garantita", leads_to: "data_inizio_reddito" },
            { id: "vincolata", label: "vincolata e sicura", leads_to: "data_inizio_reddito" }
          ]
        }
      }
    },
    {
      question_number: "6.7",
      question_id: "data_inizio_reddito",
      question_text: "Ricevo questa entrata dal {{placeholder1}} / {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Mese",
          leads_to: "data_fine_reddito",
          input_validation: "month"
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          leads_to: "data_fine_reddito",
          input_validation: "year"
        }
      }
    },
    {
      question_number: "6.8",
      question_id: "data_fine_reddito",
      question_text: "e continuerò a riceverla sicuramente fino al {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Anno o 'non lo so'",
          leads_to: "gestione_redditi_secondari", // Ritorna alla gestione dei redditi secondari
          input_validation: "free_text"
        }
      }
    }
  ]
};
