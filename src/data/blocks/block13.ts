import { RepeatingGroupBlock } from "@/types/form";

export const block13: RepeatingGroupBlock = {
  block_number: "13",
  block_id: "manager_reddito_secondario",
  title: "Redditi aggiuntivi",
  subtitle: "Aggiungi qui tutti i redditi secondari che percepisci, come affitti, pensioni, dividendi, etc.",
  empty_state_text: "Non hai ancora aggiunto nessuna fonte di reddito aggiuntiva.",
  add_button_text: "Aggiungi fonte di reddito",
  priority: 1001,
  default_active: true,
  type: "repeating_group",
  repeating_id: "secondary_income",
  subflow: [
    {
      question_id: "income_type",
      question_number: "13.1",
      question_text: "Percepisco un reddito aggiuntivo da {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "rental", label: "Reddito da affitto", leads_to: "amount_input" },
            { id: "freelance", label: "Lavoro autonomo", leads_to: "amount_input" },
            { id: "child_support", label: "Mantenimento figli", leads_to: "amount_input" },
            { id: "allowance", label: "Indennità", leads_to: "amount_input" },
            { id: "dividends", label: "Dividendi", leads_to: "amount_input" },
            { id: "pension", label: "Pensione", leads_to: "amount_input" },
            { id: "other", label: "Altro", leads_to: "amount_input" }
          ]
        }
      }
    },
    {
      question_id: "amount_input",
      question_number: "13.2",
      question_text: "Percepisco {{placeholder1}} mensilmente",
      questsion_notes: "Indica una media degli ultimi tre anni percepisci questo reddito da un po' di tempo",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          input_validation: "euro",
          leads_to: "income_from_date"
        }
      }
    },
    {
      question_id: "income_from_date",
      question_number: "13.3",
      question_text: "Ricevo questo reddito da {{placeholder1}}, {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      inline:false,
      placeholders: {
        placeholder1: {
            type: "select",
            placeholder_label: "Mese",
            options: [
              { id: "gennaio", label: "Gennaio", leads_to: "secondary_income_stability" },
              { id: "febbraio", label: "Febbraio", leads_to: "secondary_income_stability" },
              { id: "marzo", label: "Marzo", leads_to: "secondary_income_stability" },
              { id: "aprile", label: "Aprile", leads_to: "secondary_income_stability" },
              { id: "maggio", label: "Maggio", leads_to: "secondary_income_stability" },
              { id: "giugno", label: "Giugno", leads_to: "secondary_income_stability" },
              { id: "luglio", label: "Luglio", leads_to: "secondary_income_stability" },
              { id: "agosto", label: "Agosto", leads_to: "secondary_income_stability" },
              { id: "settembre", label: "Settembre", leads_to: "secondary_income_stability" },
              { id: "ottobre", label: "Ottobre", leads_to: "secondary_income_stability" },
              { id: "novembre", label: "Novembre", leads_to: "secondary_income_stability" },
              { id: "dicembre", label: "Dicembre", leads_to: "secondary_income_stability" }
            ]
          },
        placeholder2: {
            type: "input",
            input_type: "number",
            placeholder_label: "Anno",
            input_validation: "year",
            leads_to: "secondary_income_stability"
          }
      }
    },
    
    {
      question_id: "secondary_income_stability",
      question_number: "13.4",
      question_text: "Questa fonte di reddito è {{placeholder1}}, ",
      leads_to_placeholder_priority: "placeholder1",
      inline: false,
      placeholders: {
        placeholder1: {
            type: "select",
            placeholder_label: "Mese",
            options: [
              { id: "volatile", label: "volatile", leads_to: "income_to_date" },
              { id: "stabile", label: "stabile", leads_to: "income_to_date" },
              { id: "garantita", label: "garantita", leads_to: "income_to_date" },
            ]
          },
      }
    },
    {
      question_id: "income_to_date",
      question_number: "13.3",
      question_text: "e prevedo di percepire questo reddito fino a {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      inline: true,
      placeholders: {
        placeholder1: {
            type: "select",
            placeholder_label: "Mese",
            options: [
              { id: "sempre", label: "sempre", leads_to: "end_of_subflow" },
              { id: "non lo so", label: "non lo so", leads_to: "end_of_subflow" },
              { id: "una data specifica", label: "una data specifica", leads_to: "specific_date" },
            ]
          },
      }
    },
    {
      question_id: "specific_date",
      question_number: "13.3",
      question_text: ", ovvero {{placeholder1}}, {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      inline: true,
      placeholders: {
        placeholder1: {
            type: "select",
            placeholder_label: "Mese",
            options: [
              { id: "gennaio", label: "Gennaio", leads_to: "end_of_subflow" },
              { id: "febbraio", label: "Febbraio", leads_to: "end_of_subflow" },
              { id: "marzo", label: "Marzo", leads_to: "end_of_subflow" },
              { id: "aprile", label: "Aprile", leads_to: "end_of_subflow" },
              { id: "maggio", label: "Maggio", leads_to: "end_of_subflow" },
              { id: "giugno", label: "Giugno", leads_to: "end_of_subflow" },
              { id: "luglio", label: "Luglio", leads_to: "income_to_date" },
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