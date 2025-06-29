
import { Block } from "@/types/form";

export const reddito_lavoro_autonomo: Block = {
  block_number: "4",
  block_id: "reddito_lavoro_autonomo",
  title: "Reddito lavoro autonomo",
  priority: 900, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "4.1",
      question_id: "reddito_guadagno_autonomo",
      question_text: "Il mio reddito {{placeholder1}}, {{placeholder2}} dalla mia professione principale",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensilmente", label: "annuale", leads_to: "reddito_importo_lordo" },
            { id: "annualmente", label: "mensile", leads_to: "reddito_importo_lordo" }
          ]
        },
        placeholder2: {
          type: "select",
          options: [
            { id: "lordo", label: "lordo", leads_to: "reddito_importo_lordo" },
            { id: "netto", label: "netto", leads_to: "reddito_importo_lordo" }
          ]
        }
      }
    },
    {
      question_number: "4.2",
      question_id: "reddito_importo_lordo",
      question_text: "è di {{placeholder1}} euro",
      question_notes: "Indica il reddito medio percepito negli ultimi 3 anni, solo dalla tua attività principale",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "importo",
          input_validation: "euro",
          leads_to: "reddito_netto_annuo"
        }
      }
    },
    {
      question_number: "4.4",
      question_id: "reddito_netto_annuo",
      question_text: "Al netto dei costi legati all'attività e alle tasse che sostengo, annualmente in media mi rimangono {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      skippableWithNotSure: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "importo",
          leads_to: "reddito_stabilita",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "4.5",
      question_id: "reddito_stabilita",
      question_text: "Il mio reddito negli anni è stato {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "molto_stabile", label: "estremamente stabile", leads_to: "reddito_previsione" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "reddito_previsione" },
            { id: "abbastanza_volatile", label: "abbastanza volatile", leads_to: "reddito_previsione" },
            { id: "molto_volatile", label: "estremamente volatile", leads_to: "reddito_previsione" }
          ]
        }
      }
    },
    {
      question_number: "4.6",
      question_id: "reddito_previsione",
      question_text: "Infatti prevedo che l'anno prossimo il mio reddito sara invece di {{placeholder1}} euro",
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
