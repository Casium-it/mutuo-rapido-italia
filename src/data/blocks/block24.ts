
import { Block } from "@/types/form";

// Block 24 - Reddito lavoro autonomo del cointestatario
export const block24: Block = {
  block_number: "24",
  block_id: "reddito_suo_autonomo",
  title: "Reddito lavoro autonomo del cointestatario",
  default_active: false,
  questions: [
    {
      question_number: "24.1",
      question_id: "guadagno_coint",
      question_text: "Il cointestatario attraverso la sua professione principale guadagna {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "mensilmente", "label": "mensilmente", "leads_to": "importo_lordo_netto_coint"},
            {"id": "annualmente", "label": "annualmente", "leads_to": "importo_lordo_netto_coint"}
          ]
        }
      }
    },
    {
      question_number: "24.2",
      question_id: "importo_lordo_netto_coint",
      question_text: "circa un importo {{placeholder1}}",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "lordo", "label": "lordo", "leads_to": "media_3_anni_coint"},
            {"id": "netto", "label": "netto", "leads_to": "media_3_anni_coint"}
          ]
        }
      }
    },
    {
      question_number: "24.3",
      question_id: "media_3_anni_coint",
      question_text: "di {{placeholder1}} euro, in media negli ultimi 3 anni",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo medio",
          leads_to: "netto_annuo_coint"
        }
      }
    },
    {
      question_number: "24.4",
      question_id: "netto_annuo_coint",
      question_text: "Al netto dei costi legati all'attività e alle tasse che sostiene, annualmente in media gli rimangono {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Netto annuo",
          leads_to: "stabilita_coint"
        }
      }
    },
    {
      question_number: "24.5",
      question_id: "stabilita_coint",
      question_text: "Il cointestatario ritiene che questa media sia {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "molto_stabile", "label": "estremamente stabile", "leads_to": "previsione_prossimo_anno_coint"},
            {"id": "abbastanza_stabile", "label": "abbastanza stabile", "leads_to": "previsione_prossimo_anno_coint"},
            {"id": "abbastanza_volatile", "label": "abbastanza volatile", "leads_to": "previsione_prossimo_anno_coint"},
            {"id": "molto_volatile", "label": "estremamente volatile", "leads_to": "previsione_prossimo_anno_coint"}
          ]
        }
      }
    },
    {
      question_number: "24.6",
      question_id: "previsione_prossimo_anno_coint",
      question_text: "Infatti prevede che l'anno prossimo al netto di tasse e costi per attività avrà {{placeholder1}} euro",
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
