
import { Block } from "@/types/form";

// Block 4 - Reddito lavoro autonomo
export const block4: Block = {
  block_number: "4",
  block_id: "reddito_lavoro_autonomo",
  title: "Reddito lavoro autonomo",
  priority: 40, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "4.1",
      question_id: "reddito_guadagno_autonomo",
      question_text: "La tua professione principale ti permette di guadagnare {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensilmente", label: "mensilmente", leads_to: "reddito_importo_lordo" },
            { id: "annualmente", label: "annualmente", leads_to: "reddito_importo_lordo" }
          ]
        }
      }
    },
    {
      question_number: "4.2",
      question_id: "reddito_importo_lordo",
      question_text: "circa un importo {{placeholder1}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "lordo", label: "lordo", leads_to: "reddito_importo_valore" },
            { id: "netto", label: "netto", leads_to: "reddito_importo_valore" }
          ]
        }
      }
    },
    {
      question_number: "4.3",
      question_id: "reddito_importo_valore",
      question_text: "di {{placeholder1}} euro, in media negli ultimi 3 anni",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "reddito_netto_annuo"
        }
      }
    },
    {
      question_number: "4.4",
      question_id: "reddito_netto_annuo",
      question_text: "Al netto dei costi legati all'attività e alle tasse che sostengo, annualmente in media mi rimangono {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo netto annuo",
          leads_to: "reddito_stabilita"
        }
      }
    },
    {
      question_number: "4.5",
      question_id: "reddito_stabilita",
      question_text: "Ritengo che questa media {{placeholder1}}",
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
      question_text: "Infatti prevedo che l'anno prossimo al netto di tasse e costi per attività avrò {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Previsione futura",
          leads_to: "next_block"
        }
      }
    }
  ]
};
