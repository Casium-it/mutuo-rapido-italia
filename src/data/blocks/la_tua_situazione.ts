
import { Block } from "@/types/form";

export const la_tua_situazione: Block = {
  block_number: "2",
  block_id: "la_tua_situazione",
  title: "La tua situazione",
  priority: 500, // Priorità aggiunta
  default_active: true,
  questions: [
    {
      question_number: "2.1",
      question_id: "eta_e_citta",
      question_text: "Io ho {{placeholder1}} anni e vivo a {{placeholder2}},{{placeholder3}}",
      leads_to_placeholder_priority: "placeholder3", // Specifica quale placeholder ha priorità per la navigazione
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Età",
          input_validation: "age"
        },
        placeholder2: {
          type: "input",
          input_type: "text",
          placeholder_label: "Città",
          input_validation: "city"
        },
        placeholder3: {
          type: "input",
          input_type: "text",
          placeholder_label: "CAP",
          leads_to: "figli_a_carico",
          input_validation: "cap"
        }
      }
    },
    {
      question_number: "2.2",
      question_id: "figli_a_carico",
      question_text: "Ho {{placeholder1}} a carico",
      leads_to_placeholder_priority: "placeholder1", // Anche se c'è un solo placeholder, è obbligatorio specificare la priorità
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "0", "label": "0 figli", "leads_to": "tipo_abitazione"},
            {"id": "1", "label": "1 figlio", "leads_to": "tipo_abitazione"},
            {"id": "2", "label": "2 figli", "leads_to": "tipo_abitazione"},
            {"id": "3", "label": "3 figli", "leads_to": "tipo_abitazione"},
            {"id": "4+", "label": "4 o più figli", "leads_to": "tipo_abitazione"}
          ]
        }
      }
    },
    {
      question_number: "2.3",
      question_id: "tipo_abitazione",
      question_text: "Attualmente vivo in {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "affitto", "label": "una casa in affitto", "leads_to": "spesa_affitto"},
            {"id": "aziendale", "label": "un affitto pagato dall'azienda", "leads_to": "casa_proprieta"},
            {"id": "proprieta", "label": "una casa di mia proprietà", "leads_to": "intenzione_vendita"},
            {"id": "non_pago", "label": "una casa che non pago", "leads_to": "casa_proprieta"}
          ]
        }
      }
    },
    {
      question_number: "2.4",
      question_id: "spesa_affitto",
      question_text: "che pago {{placeholder1}} euro al mese, compreso condominio",
      question_notes: "Indica la tua quota dell'affitto se la casa è condivisa",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo mensile",
          leads_to: "casa_proprieta",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "2.5",
      question_id: "casa_proprieta",
      question_text: "Io {{placeholder1}} una casa di proprietà",
      question_notes: "Indica di sì anche se la casa è cointestata con il tuo cointestatario",
      inline: false,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "possiede_casa",
              label: "ho",
              leads_to: "intenzione_vendita",
            },
            {
              id: "no_casa_proprieta",
              label: "non ho",
              leads_to: "next_block"
            }
          ]
        }
      }
    },
    {
      question_number: "2.5.1",
      question_id: "intenzione_vendita",
      question_text: "che {{placeholder1}} per finanziare il nuovo acquisto",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              "id": "vendo",
              "label": "intendo vendere",
              "leads_to": "next_block",
              "add_block": "casa_da_vendere"
            },
            {
              "id": "non_vendo",
              "label": "non intendo vendere",
              "leads_to": "next_block"
            }
          ]
        }
      }
    }
  ]
};
