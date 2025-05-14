
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
            {"id": "ha_ricevuto", "label": "ha ricevuto", "leads_to": "tipo_reddito_secondario_coint"},
            {"id": "non_ha_ricevuto", "label": "non ha ricevuto", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "26.2",
      question_id: "tipo_reddito_secondario_coint",
      question_text: "Riceve reddito aggiuntivo da {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "affitti", "label": "affitti", "leads_to": "media_reddito_secondario_coint"},
            {"id": "lavoro_autonomo", "label": "lavoro autonomo", "leads_to": "media_reddito_secondario_coint"},
            {"id": "assegno_minori", "label": "assegno minori", "leads_to": "media_reddito_secondario_coint"},
            {"id": "supporto_familiari", "label": "supporto familiari", "leads_to": "media_reddito_secondario_coint"},
            {"id": "dividendi_diritti", "label": "dividendi e diritti", "leads_to": "media_reddito_secondario_coint"},
            {"id": "altro", "label": "altro", "leads_to": "altro_descrizione_coint"}
          ]
        }
      }
    },
    {
      question_number: "26.2.1",
      question_id: "altro_descrizione_coint",
      question_text: "Specifica la fonte del reddito aggiuntivo",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Descrizione",
          leads_to: "media_reddito_secondario_coint"
        }
      }
    },
    {
      question_number: "26.3",
      question_id: "media_reddito_secondario_coint",
      question_text: "Negli ultimi 3 anni di media ha ricevuto {{placeholder1}} euro",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_reddito_secondario_coint"
        }
      }
    },
    {
      question_number: "26.4",
      question_id: "frequenza_reddito_secondario_coint",
      question_text: "{{placeholder1}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "mensile", "label": "mensilmente", "leads_to": "lordo_netto_reddito_secondario_coint"},
            {"id": "annuale", "label": "annualmente", "leads_to": "lordo_netto_reddito_secondario_coint"}
          ]
        }
      }
    },
    {
      question_number: "26.5",
      question_id: "lordo_netto_reddito_secondario_coint",
      question_text: "{{placeholder1}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "netto", "label": "netti", "leads_to": "stabilita_reddito_secondario_coint"},
            {"id": "lordo", "label": "lordi", "leads_to": "stabilita_reddito_secondario_coint"}
          ]
        }
      }
    },
    {
      question_number: "26.6",
      question_id: "stabilita_reddito_secondario_coint",
      question_text: "Ritiene questa entrata {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "volatile", "label": "volatile", "leads_to": "data_inizio_reddito_coint"},
            {"id": "abbastanza_stabile", "label": "abbastanza stabile", "leads_to": "data_inizio_reddito_coint"},
            {"id": "quasi_garantita", "label": "quasi garantita", "leads_to": "data_inizio_reddito_coint"},
            {"id": "vincolata", "label": "vincolata e sicura", "leads_to": "data_inizio_reddito_coint"}
          ]
        }
      }
    },
    {
      question_number: "26.7",
      question_id: "data_inizio_reddito_coint",
      question_text: "Riceve questa entrata dal {{placeholder1}} / {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Mese",
          leads_to: "data_fine_reddito_coint"
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          leads_to: "data_fine_reddito_coint"
        }
      }
    },
    {
      question_number: "26.8",
      question_id: "data_fine_reddito_coint",
      question_text: "e continuerà a riceverla sicuramente fino al {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Anno o 'non lo sa'",
          leads_to: "tipo_reddito_secondario_coint"
        }
      }
    }
  ]
};
