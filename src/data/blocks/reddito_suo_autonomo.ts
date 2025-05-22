
import { Block } from "@/types/form";

export const reddito_suo_autonomo: Block = {
  block_number: "24",
  block_id: "reddito_suo_autonomo",
  title: "Reddito lavoro autonomo del cointestatario",
  priority: 1300, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "24.1",
      question_id: "reddito_guadagno_autonomo_coint",
      question_text: "Il suo reddito {{placeholder1}}, {{placeholder2}} dalla sua professione principale",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensilmente", label: "annuale", leads_to: "reddito_importo_lordo_coint" },
            { id: "annualmente", label: "mensile", leads_to: "reddito_importo_lordo_coint" }
          ]
        },
        placeholder2: {
          type: "select",
          options: [
            { id: "lordo", label: "lordo", leads_to: "reddito_importo_lordo_coint" },
            { id: "netto", label: "netto", leads_to: "reddito_importo_lordo_coint" }
          ]
        }
      }
    },
    {
      question_number: "24.2",
      question_id: "reddito_importo_lordo_coint",
      question_text: "è di {{placeholder1}} euro",
      question_notes: "Indica il reddito medio percepito negli ultimi 3 anni, solo dalla sua attività principale",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "importo",
          input_validation: "euro",
          leads_to: "reddito_netto_annuo_coint"
        }
      }
    },
    {
      question_number: "24.3",
      question_id: "reddito_netto_annuo_coint",
      question_text: "Al netto dei costi legati all'attività e alle tasse che sostengo, annualmente in media gli rimangono {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      skippableWithNotSure: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "importo",
          leads_to: "reddito_stabilita_coint",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "24.4",
      question_id: "reddito_stabilita_coint",
      question_text: "Il suo reddito negli anni è stato {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "molto_stabile", label: "estremamente stabile", leads_to: "reddito_previsione_coint" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "reddito_previsione_coint" },
            { id: "abbastanza_volatile", label: "abbastanza volatile", leads_to: "reddito_previsione_coint" },
            { id: "molto_volatile", label: "estremamente volatile", leads_to: "reddito_previsione_coint" }
          ]
        }
      }
    },
    {
      question_number: "24.5",
      question_id: "reddito_previsione_coint",
      question_text: "Infatti prevede che l'anno prossimo il suo reddito sara invece di {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      question_notes: "Indica un importo annuale netto",
      skippableWithNotSure: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Previsione futura",
          leads_to: "next_block",
          input_validation: "euro"
        }
      }
    }
  ]
};
