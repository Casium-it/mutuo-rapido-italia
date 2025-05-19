import { RepeatingGroupBlock } from "@/types/form";

export const block6_repeating: RepeatingGroupBlock = {
  block_number: "14",
  block_id: "manager_finanziamenti",
  title: "Finanziamenti in corso",
  subtitle: "Aggiungi qui tutti i finanziamenti che stai attualmente pagando, come prestiti, leasing, etc.",
  empty_state_text: "Non hai ancora aggiunto nessun finanziamento in corso.",
  add_button_text: "Aggiungi finanziamento",
  priority: 1501,
  default_active: false,
  type: "repeating_group",
  repeating_id: "current_financing",
  subflow: [
    {
      question_id: "financing_type",
      question_number: "14.1",
      question_text: "Ho un finanziamento per {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "car", label: "Auto", leads_to: "amount_input" },
            { id: "personal_loan", label: "Prestito personale", leads_to: "amount_input" },
            { id: "mortgage", label: "Mutuo", leads_to: "amount_input" },
            { id: "leasing", label: "Leasing", leads_to: "amount_input" },
            { id: "credit_card", label: "Carta di credito", leads_to: "amount_input" },
            { id: "other", label: "Altro", leads_to: "amount_input" }
          ]
        }
      }
    },
    {
      question_id: "amount_input",
      question_number: "14.2",
      question_text: "La rata mensile è di {{placeholder1}}",
      questsion_notes: "Indica l'importo esatto della rata mensile",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          input_validation: "euro",
          leads_to: "financing_end_date"
        }
      }
    },
    {
      question_id: "financing_end_date",
      question_number: "14.3",
      question_text: "Il finanziamento termina il {{placeholder1}}, {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      inline: false,
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