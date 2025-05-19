import { Block } from "@/types/form";

// Block 22 - Cointestatario
export const block22: Block = {
  block_number: "22",
  block_id: "cointestatario",
  title: "Il tuo cointestatario",
  priority: 600, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "22.0",
      question_id: "eta_e_citta_coint",
      question_text: "Il tuo cointestatario ha {{placeholder1}} anni e vive a {{placeholder2}}, {{placeholder3}}",
      leads_to_placeholder_priority: "placeholder3",
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
          leads_to: "figli_a_carico_coint",
          input_validation: "cap",
        }
      }
    },
    {
      question_number: "22.1",
      question_id: "figli_a_carico_coint",
      question_text: "Il tuo cointestatario ha {{placeholder1}} a carico oltre quelli da te dichiarati",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "0", label: "nessun figlio", leads_to: "residenza_cointestatario" },
            { id: "1", label: "1 figlio", leads_to: "residenza_cointestatario" },
            { id: "2", label: "2 figli", leads_to: "residenza_cointestatario" },
            { id: "3", label: "3 figli", leads_to: "residenza_cointestatario" },
            { id: "4+", label: "4+ figli", leads_to: "residenza_cointestatario" }
          ]
        }
      }
    },
    {
      question_number: "22.2",
      question_id: "residenza_cointestatario",
      question_text: "Attualmente il tuo cointestatario vive in {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "affitto", label: "una casa in affitto", leads_to: "spesa_affitto_coint" },
            { id: "aziendale", label: "un affitto pagato dall'azienda", leads_to: "casa_proprieta_coint" },
            { id: "proprieta", label: "una casa di sua proprietà", leads_to: "intenzione_vendita_coint" },
            { id: "non_pago", label: "una casa che non paga", leads_to: "casa_proprieta_coint" }
          ]
        }
      }
    },
    {
      question_number: "22.3",
      question_id: "spesa_affitto_coint",
      question_text: "che paga {{placeholder1}} euro al mese, compreso condominio",
      question_notes: "Indica la sua quota dell'affitto se la casa è condivisa",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo mensile",
          leads_to: "casa_proprieta_coint",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "22.4",
      question_id: "casa_proprieta_coint",
      question_text: "Il cointestatario {{placeholder1}} una casa di proprietà",
      question_notes: "Indica di sì anche se la casa è cointestata con te",
      inline: false,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "coint_possiede_casa",
              label: "possiede",
              leads_to: "intenzione_vendita_coint",
            },
            {
              id: "no_casa_proprieta_coint",
              label: "non possiede",
              leads_to: "convivenza_cointestatario"
            }
          ]
        }
      }
    },
    {
      question_number: "22.4.1",
      question_id: "intenzione_vendita_coint",
      question_text: "che {{placeholder1}} vendere per finanziare il nuovo acquisto.",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "casa_proprieta_coint",
              label: "intende",
              leads_to: "convivenza_cointestatario",
              add_block: "casa_cointestatario_vendere"
            },
            {
              id: "no_casa_proprieta_coint",
              label: "non intende",
              leads_to: "convivenza_cointestatario"
            }
          ]
        }
      }
    },
    {
      question_number: "22.5",
      question_id: "convivenza_cointestatario",
      question_text: "Tu e il tuo cointestatario {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "insieme", label: "vivete insieme", leads_to: "redditi_cointestatario" },
            { id: "separati", label: "non vivete insieme", leads_to: "redditi_cointestatario" }
          ]
        }
      }
    },
    {
      question_number: "22.6",
      question_id: "redditi_cointestatario",
      question_text: "Il tuo cointestatario {{placeholder1}} redditi di qualunque natura",
      question_notes: "Con reddito si intende qualunque tipo di entrata economica, anche se non da lavoro",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "percepisce", label: "percepisce", leads_to: "next_block", add_block:"la_sua_professione"},
            { id: "non_percepisce", label: "non percepisce", leads_to: "next_block",}
          ]
        }
      }
    },

  ]
};