import { Block } from "@/types/form";

// Block 25 - Reddito principale del cointestatario
export const block25: Block = {
  block_number: "25",
  block_id: "reddito_suo_principale",
  title: "Reddito principale del cointestatario",
  priority: 1200, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "25.1",
      question_id: "busta_paga_periodicita_coint",
      question_text: "Il mio cointestatario percepisce un reddito {{placeholder1}} {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensile", label: "mensile", leads_to: "busta_paga_importo_coint" },
            { id: "annuale", label: "annuale", leads_to: "busta_paga_importo_coint" }
          ]
        },
        placeholder2: {
          type: "select",
          options: [
            { id: "netta", label: "netto", leads_to: "busta_paga_importo_coint" },
            { id: "lorda", label: "lordo", leads_to: "busta_paga_importo_coint" }
          ]
        }
      }
    },
    {
      question_number: "25.2",
      question_id: "busta_paga_importo_coint",
      question_text: "di euro {{placeholder1}}, senza bonus e straordinari.",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          input_validation: "euro",
          leads_to: "contratto_tredicesime_coint"
        }
      }
    },
    {
      question_number: "25.3",
      question_id: "contratto_tredicesime_coint",
      question_text: "Il suo contratto {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "no_13", label: "non comprende 13º e 14º", leads_to: "ricezione_bonus_coint" },
            { id: "solo_13", label: "comprende la 13º", leads_to: "ricezione_bonus_coint" },
            { id: "tredici_quattordici", label: "comprende 13º e 14º", leads_to: "ricezione_bonus_coint" }
          ]
        }
      }
    },
    {
      question_number: "25.4",
      question_id: "ricezione_bonus_coint",
      question_text: "Nella sua posizione {{placeholder1}} bonus.",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "riceve", label: "riceve", leads_to: "importo_bonus_coint" },
            { id: "non_riceve", label: "non riceve", leads_to: "ricezione_benefit_coint" }
          ]
        }
      }
    },
    {
      question_number: "25.5",
      question_id: "importo_bonus_coint",
      question_text: "Il bonus in media è di {{placeholder1}} euro netti annuali, negli ultimi 3 anni",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo bonus",
          leads_to: "bonus_stabilita_coint",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "25.6",
      question_id: "bonus_stabilita_coint",
      question_text: "Il suo bonus è {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "volatile", label: "volatile", leads_to: "ricezione_benefit" },
            { id: "stabile", label: "abbastanza stabile", leads_to: "ricezione_benefit" },
            { id: "garantito", label: "quasi garantito", leads_to: "ricezione_benefit" },
            { id: "pattuito", label: "pattuito nel contratto", leads_to: "ricezione_benefit" }
          ]
        }
      }
    },
    {
      question_number: "25.7",
      question_id: "ricezione_benefit_coint",
      question_text: "Nella sua posizione {{placeholder1}} benefit aziendali.",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "riceve", label: "riceve", leads_to: "tipologia_benefit_coint" },
            { id: "non_riceve", label: "non riceve", leads_to: "next_block" }
          ]
        }
      }
    },
    {
      //assolutamente da MIGLIORARE
      question_number: "25.8",
      question_id: "tipologia_benefit_coint",
      question_text: "I suoi benefit sono: {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          multiple: true,
          options: [
            { id: "buoni_pasto", label: "buoni pasto", leads_to: "next_block" },
            { id: "buoni_carburante", label: "buoni carburante", leads_to: "next_block" },
            { id: "macchina_aziendale", label: "macchina aziendale", leads_to: "next_block" },
            { id: "convenzioni", label: "convenzioni e sconti", leads_to: "next_block" },
            { id: "assicurazioni", label: "assicurazioni", leads_to: "next_block" },
            { id: "pensione_privata", label: "pensione privata", leads_to: "next_block" },
            { id: "altro", label: "altro", leads_to: "next_block" }
          ]
        }
      }
    }
  ]
};
