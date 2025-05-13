
import { Block } from "@/types/form";

// Block 22 - Cointestatario
export const block22: Block = {
  block_number: "22",
  block_id: "cointestatario",
  title: "Il tuo cointestatario",
  default_active: false,
  questions: [
    {
      question_number: "22.1",
      question_id: "figli_a_carico_coint",
      question_text: "Il tuo cointestatario ha {{placeholder1}} a carico oltre quelli da te dichiarati",
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
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "affitto", label: "una casa in affitto", leads_to: "spesa_affitto_coint" },
            { id: "aziendale", label: "un affitto aziendale", leads_to: "spesa_affitto_coint" },
            { id: "proprieta", label: "una casa di sua proprietà", leads_to: "intenzione_vendita_coint" },
            { id: "non_pago", label: "una casa che non paga", leads_to: "convivenza_cointestatario" }
          ]
        }
      }
    },
    {
      question_number: "22.3",
      question_id: "spesa_affitto_coint",
      question_text: "che paga {{placeholder1}} euro al mese, compreso condominio",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo mensile",
          leads_to: "convivenza_cointestatario"
        }
      }
    },
    {
      question_number: "22.4",
      question_id: "intenzione_vendita_coint",
      question_text: "che {{placeholder1}} per finanziare il nuovo acquisto",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "vendo",
              label: "intende vendere",
              leads_to: "convivenza_cointestatario",
              add_block: "casa_da_vendere"
            },
            {
              id: "non_vendo",
              label: "non intende vendere",
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
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "insieme", label: "vivete insieme", leads_to: "eta_e_citta_coint" },
            { id: "separati", label: "non vivete insieme", leads_to: "eta_e_citta_coint" }
          ]
        }
      }
    },
    {
      question_number: "22.6",
      question_id: "eta_e_citta_coint",
      question_text: "Il tuo cointestatario ha {{placeholder1}} anni e vive a {{placeholder2}}, {{placeholder3}}",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Età"
        },
        placeholder2: {
          type: "input",
          input_type: "text",
          placeholder_label: "Città"
        },
        placeholder3: {
          type: "input",
          input_type: "text",
          placeholder_label: "CAP",
          leads_to: "next_block"
        }
      }
    }
  ]
};
