
import { Block } from "@/types/form";

// Block 27 - I suoi finanziamenti
export const block27: Block = {
  block_number: "27",
  block_id: "finanziamenti_suo",
  title: "I suoi finanziamenti",
  priority: 77, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "27.1",
      question_id: "presenza_finanziamenti_coint",
      question_text: "Ad oggi {{placeholder1}} finanziamenti aperti",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "ha", "label": "ha", "leads_to": "tipo_finanziamento_coint"},
            {"id": "non_ha", "label": "non ha", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "27.2",
      question_id: "tipo_finanziamento_coint",
      question_text: "Ha un finanziamento per {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "mutuo", "label": "un altro mutuo", "leads_to": "oggetto_finanziamento_coint"},
            {"id": "prestito_personale", "label": "un prestito personale", "leads_to": "oggetto_finanziamento_coint"}
          ]
        }
      }
    },
    {
      question_number: "27.3",
      question_id: "oggetto_finanziamento_coint",
      question_text: "Per questo finanziamento ha dei pagamenti {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "macchina", "label": "la macchina", "leads_to": "importo_finanziamento_coint"},
            {"id": "leasing", "label": "un leasing", "leads_to": "importo_finanziamento_coint"},
            {"id": "altro", "label": "altro", "leads_to": "oggetto_finanziamento_altro_coint"}
          ]
        }
      }
    },
    {
      question_number: "27.3.1",
      question_id: "oggetto_finanziamento_altro_coint",
      question_text: "Specifica la destinazione del finanziamento",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Descrizione",
          leads_to: "importo_finanziamento_coint"
        }
      }
    },
    {
      question_number: "27.4",
      question_id: "importo_finanziamento_coint",
      question_text: "di {{placeholder1}} euro",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_rata_coint"
        }
      }
    },
    {
      question_number: "27.5",
      question_id: "frequenza_rata_coint",
      question_text: "{{placeholder1}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "mensili", "label": "mensili", "leads_to": "data_fine_finanziamento_coint"},
            {"id": "ogni_2_mesi", "label": "ogni 2 mesi", "leads_to": "data_fine_finanziamento_coint"},
            {"id": "ogni_3_mesi", "label": "ogni 3 mesi", "leads_to": "data_fine_finanziamento_coint"},
            {"id": "ogni_6_mesi", "label": "ogni 6 mesi", "leads_to": "data_fine_finanziamento_coint"},
            {"id": "annuali", "label": "annuali", "leads_to": "data_fine_finanziamento_coint"}
          ]
        }
      }
    },
    {
      question_number: "27.6",
      question_id: "data_fine_finanziamento_coint",
      question_text: "che finiranno a {{placeholder1}} / {{placeholder2}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder2",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Mese",
          leads_to: "storico_pagamento_coint"
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          leads_to: "storico_pagamento_coint"
        }
      }
    },
    {
      question_number: "27.7",
      question_id: "storico_pagamento_coint",
      question_text: "Per questo finanziamento ha pagato {{placeholder1}} regolarmente",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "sempre", "label": "sempre", "leads_to": "tipo_finanziamento_coint"},
            {"id": "quasi_sempre", "label": "quasi sempre", "leads_to": "tipo_finanziamento_coint"},
            {"id": "poco", "label": "poco", "leads_to": "tipo_finanziamento_coint"}
          ]
        }
      }
    }
  ]
};
