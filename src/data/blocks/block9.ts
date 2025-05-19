import { Block } from "@/types/form";

// Block 9 - La casa da vendere
export const block9: Block = {
  block_number: "9",
  block_id: "casa_da_vendere",
  title: "La casa da vendere",
  priority: 1700, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "9.1",
      question_id: "valore_casa_vendita",
      question_text: "Il valore della casa da vendere oggi è circa {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Valore stimato",
          leads_to: "presenza_mutuo_casa_vendita",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "9.2",
      question_id: "presenza_mutuo_casa_vendita",
      question_text: "La casa attualmente {{placeholder1}} da saldare",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "ha_mutuo",
              label: "ha un mutuo",
              leads_to: "dettagli_mutuo_casa_vendita"
            },
            {
              id: "no_mutuo",
              label: "non ha un mutuo",
              leads_to: "next_block"
            }
          ]
        }
      }
    },
    {
      question_number: "9.3",
      question_id: "dettagli_mutuo_casa_vendita",
      question_text: "Al mutuo mancano {{placeholder1}} euro da saldare. Il mutuo ha un tasso {{placeholder 2}} del {{placeholder3}}%, e finirà nel {{placeholder4}}",
      leads_to_placeholder_priority: "placeholder4",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo residuo",
          input_validation: "euro"
        },
        placeholder2:{
          type: "select",
          options: [
            {
              id: "fisso",
              label: "fisso",
              leads_to: "next_block"
            },
            {
              id: "variabile",
              label: "variabile",
              leads_to: "next_block"
            },
          ]
        },
        placeholder3: {
          type: "input",
          input_type: "number",
          placeholder_label: "Tasso percentuale",
          input_validation: "free_text"
        },
        placeholder4: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          leads_to: "next_block",
          input_validation: "year"
        }
      }
    }
  ]
};
