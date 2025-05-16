import { Block } from "@/types/form";

// Block 7 - Finanziamenti
export const block7: Block = {
  block_number: "7",
  block_id: "finanziamenti",
  title: "I tuoi finanziamenti",
  priority: 70,
  default_active: true,
  questions: [
    {
      question_number: "7.1",
      question_id: "presenza_finanziamenti",
      question_text: "Ad oggi {{placeholder1}} finanziamenti aperti",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "ho",
              label: "ho",
              leads_to: "tipo_finanziamento"
            },
            {
              id: "non_ho",
              label: "non ho",
              leads_to: "next_block"
            }
          ]
        }
      }
    },
    {
      question_number: "7.2",
      question_id: "tipo_finanziamento",
      question_text: "Ho un finanziamento per {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      repeatable: true, // Questa domanda è l'inizio di un ciclo ripetibile
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "mutuo",
              label: "un altro mutuo",
              leads_to: "oggetto_finanziamento"
            },
            {
              id: "prestito_personale",
              label: "un prestito personale",
              leads_to: "oggetto_finanziamento"
            }
          ]
        }
      }
    },
    {
      question_number: "7.3",
      question_id: "oggetto_finanziamento",
      question_text: "Per questo finanziamento ho dei pagamenti per {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "macchina",
              label: "la macchina",
              leads_to: "importo_finanziamento"
            },
            {
              id: "leasing",
              label: "un leasing",
              leads_to: "importo_finanziamento"
            },
            {
              id: "altro",
              label: "altro",
              leads_to: "oggetto_finanziamento_altro"
            }
          ]
        }
      }
    },
    {
      question_number: "7.3.1",
      question_id: "oggetto_finanziamento_altro",
      question_text: "Specifica la destinazione del finanziamento",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Descrizione",
          leads_to: "importo_finanziamento",
          input_validation: "free_text"
        }
      }
    },
    {
      question_number: "7.4",
      question_id: "importo_finanziamento",
      question_text: "di {{placeholder1}} euro",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_rata",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "7.5",
      question_id: "frequenza_rata",
      question_text: "{{placeholder1}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "mensili",
              label: "mensili",
              leads_to: "data_fine_finanziamento"
            },
            {
              id: "ogni_2_mesi",
              label: "ogni 2 mesi",
              leads_to: "data_fine_finanziamento"
            },
            {
              id: "ogni_3_mesi",
              label: "ogni 3 mesi",
              leads_to: "data_fine_finanziamento"
            },
            {
              id: "ogni_6_mesi",
              label: "ogni 6 mesi",
              leads_to: "data_fine_finanziamento"
            },
            {
              id: "annuali",
              label: "annuali",
              leads_to: "data_fine_finanziamento"
            }
          ]
        }
      }
    },
    {
      question_number: "7.6",
      question_id: "data_fine_finanziamento",
      question_text: "che finiranno a {{placeholder1}} / {{placeholder2}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder2",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Mese",
          leads_to: "storico_pagamento",
          input_validation: "month"
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          leads_to: "storico_pagamento",
          input_validation: "year"
        }
      }
    },
    {
      question_number: "7.7",
      question_id: "storico_pagamento",
      question_text: "Per questo finanziamento ho pagato {{placeholder1}} regolarmente",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "sempre",
              label: "sempre",
              leads_to: "tipo_finanziamento" // Torna a tipo_finanziamento per iniziare un nuovo ciclo
            },
            {
              id: "quasi_sempre",
              label: "quasi sempre",
              leads_to: "tipo_finanziamento" // Torna a tipo_finanziamento per iniziare un nuovo ciclo
            },
            {
              id: "poco",
              label: "poco",
              leads_to: "tipo_finanziamento" // Torna a tipo_finanziamento per iniziare un nuovo ciclo
            }
          ]
        }
      }
    }
  ]
};
