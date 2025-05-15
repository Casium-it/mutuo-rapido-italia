
import { RepeatingGroupBlock } from "@/types/form";

export const block6_repeating: RepeatingGroupBlock = {
  block_number: "6",
  block_id: "secondary_income_manager",
  title: "Redditi aggiuntivi",
  priority: 60,
  default_active: true,
  type: "repeating_group",
  repeating_id: "secondary_income",
  subflow: [
    {
      question_id: "income_type",
      question_number: "6.1",
      question_text: "Che tipo di reddito aggiuntivo hai?",
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
      question_number: "6.2",
      question_text: "Importo mensile (€)",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          input_validation: "euro",
          leads_to: "income_description"
        }
      }
    },
    {
      question_id: "income_description",
      question_number: "6.3",
      question_text: "Descrizione (opzionale)",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Descrizione",
          input_validation: "free_text",
          leads_to: "end_of_subflow"
        }
      }
    }
  ]
};
