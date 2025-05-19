
import { Block } from "@/types/form";

export const reddito_secondario_blueprint: Block = {
  block_number: "6D",
  block_id: "reddito_secondario_blueprint{copyNumber}",
  title: "Dettagli reddito secondario",
  priority: 61,
  multiBlock: true,
  invisible: true,
  questions: [
    {
      question_id: "income_type{copyNumber}",
      question_number: "13.1",
      question_text: "Percepisco un reddito aggiuntivo da {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "rental", label: "Reddito da affitto", leads_to: "amount_input{copyNumber}" },
            { id: "freelance", label: "Lavoro autonomo", leads_to: "amount_input{copyNumber}" },
            { id: "child_support", label: "Mantenimento figli", leads_to: "amount_input{copyNumber}" },
            { id: "allowance", label: "Indennità", leads_to: "amount_input{copyNumber}" },
            { id: "dividends", label: "Dividendi", leads_to: "amount_input{copyNumber}" },
            { id: "pension", label: "Pensione", leads_to: "amount_input{copyNumber}" },
            { id: "other", label: "Altro", leads_to: "amount_input{copyNumber}" }
          ]
        }
      }
    },
    {
      question_id: "amount_input{copyNumber}",
      question_number: "13.2",
      question_text: "Percepisco {{placeholder1}} mensilmente",
      question_notes: "Indica una media degli ultimi tre anni percepisci questo reddito da un po' di tempo",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          input_validation: "euro",
          leads_to: "income_from_date{copyNumber}"
        }
      }
    },
    {
      question_id: "income_from_date{copyNumber}",
      question_number: "13.3",
      question_text: "Ricevo questo reddito da {{placeholder1}}, {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      inline: false,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "gennaio", label: "Gennaio", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "febbraio", label: "Febbraio", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "marzo", label: "Marzo", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "aprile", label: "Aprile", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "maggio", label: "Maggio", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "giugno", label: "Giugno", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "luglio", label: "Luglio", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "agosto", label: "Agosto", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "settembre", label: "Settembre", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "ottobre", label: "Ottobre", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "novembre", label: "Novembre", leads_to: "secondary_income_stability{copyNumber}" },
            { id: "dicembre", label: "Dicembre", leads_to: "secondary_income_stability{copyNumber}" }
          ]
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          input_validation: "year",
          leads_to: "secondary_income_stability{copyNumber}"
        }
      }
    },
    {
      question_id: "secondary_income_stability{copyNumber}",
      question_number: "13.4",
      question_text: "Questa fonte di reddito è {{placeholder1}}, ",
      leads_to_placeholder_priority: "placeholder1",
      inline: false,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "volatile", label: "volatile", leads_to: "income_to_date{copyNumber}" },
            { id: "stabile", label: "stabile", leads_to: "income_to_date{copyNumber}" },
            { id: "garantita", label: "garantita", leads_to: "income_to_date{copyNumber}" }
          ]
        }
      }
    },
    {
      question_id: "income_to_date{copyNumber}",
      question_number: "13.5",
      question_text: "e prevedo di percepire questo reddito fino a {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "sempre", label: "sempre", leads_to: "end_of_subflow" },
            { id: "non lo so", label: "non lo so", leads_to: "end_of_subflow" },
            { id: "una data specifica", label: "una data specifica", leads_to: "specific_date{copyNumber}" }
          ]
        }
      }
    },
    {
      question_id: "specific_date{copyNumber}",
      question_number: "13.6",
      question_text: ", ovvero {{placeholder1}}, {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "gennaio", label: "Gennaio", leads_to: "end_of_subflow" },
            { id: "febbraio", label: "Febbraio", leads_to: "end_of_subflow" },
            { id: "marzo", label: "Marzo", leads_to: "end_of_subflow" },
            { id: "aprile", label: "Aprile", leads_to: "end_of_subflow" },
            { id: "maggio", label: "Maggio", leads_to: "end_of_subflow" },
            { id: "giugno", label: "Giugno", leads_to: "end_of_subflow" },
            { id: "luglio", label: "Luglio", leads_to: "end_of_subflow" },
            { id: "agosto", label: "Agosto", leads_to: "end_of_subflow" },
            { id: "settembre", label: "Settembre", leads_to: "end_of_subflow" },
            { id: "ottobre", label: "Ottobre", leads_to: "end_of_subflow" },
            { id: "novembre", label: "Novembre", leads_to: "end_of_subflow" },
            { id: "dicembre", label: "Dicembre", leads_to: "end_of_subflow" }
          ]
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          input_validation: "year",
          leads_to: "end_of_subflow"
        }
      }
    }
  ]
};
