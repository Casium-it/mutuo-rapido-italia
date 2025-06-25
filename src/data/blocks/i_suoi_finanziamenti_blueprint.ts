
import { Block } from "@/types/form";

export const i_suoi_finanziamenti_blueprint: Block = {
  block_number: "13D",
  block_id: "i_suoi_finanziamenti_blueprint{copyNumber}",
  title: "Dettagli finanziamento cointestatario",
  priority: 2201,
  multiBlock: true,
  invisible: true,
  questions: [
    {
      question_id: "financing_type_coint{copyNumber}",
      question_number: "24.1",
      question_text: "Ha un finanziamento di tipo {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "personal_loan", label: "Prestito personale", leads_to: "finanziamenti_importo_coint{copyNumber}" },
            { id: "car_loan", label: "Prestito auto", leads_to: "finanziamenti_importo_coint{copyNumber}" },
            { id: "credit_card", label: "Carta di credito", leads_to: "finanziamenti_importo_coint{copyNumber}" },
            { id: "mortgage", label: "Mutuo", leads_to: "finanziamenti_importo_coint{copyNumber}" },
            { id: "other", label: "Altro", leads_to: "finanziamenti_importo_coint{copyNumber}" }
          ]
        }
      }
    },
    {
      question_id: "finanziamenti_importo_coint{copyNumber}",
      question_number: "24.2",
      question_text: "L'importo della rata mensile è di {{placeholder1}} euro",
      question_notes: "Indica l'importo della rata mensile che paga attualmente",
      leads_to_placeholder_priority: "placeholder1",
      skippableWithNotSure: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          input_validation: "euro",
          leads_to: "remaining_amount_coint{copyNumber}"
        }
      }
    },
    {
      question_id: "remaining_amount_coint{copyNumber}",
      question_number: "24.3",
      question_text: "Il capitale residuo è di {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      skippableWithNotSure: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          input_validation: "euro",
          leads_to: "financing_end_date_coint{copyNumber}"
        }
      }
    },
    {
      question_id: "financing_end_date_coint{copyNumber}",
      question_number: "24.4",
      question_text: "Terminerà di pagare questo finanziamento {{placeholder1}}, {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      inline: false,
      skippableWithNotSure: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "gennaio", label: "Gennaio", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "febbraio", label: "Febbraio", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "marzo", label: "Marzo", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "aprile", label: "Aprile", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "maggio", label: "Maggio", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "giugno", label: "Giugno", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "luglio", label: "Luglio", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "agosto", label: "Agosto", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "settembre", label: "Settembre", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "ottobre", label: "Ottobre", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "novembre", label: "Novembre", leads_to: "financing_institution_coint{copyNumber}" },
            { id: "dicembre", label: "Dicembre", leads_to: "financing_institution_coint{copyNumber}" }
          ]
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          input_validation: "year",
          leads_to: "financing_institution_coint{copyNumber}"
        }
      }
    },
    {
      question_id: "financing_institution_coint{copyNumber}",
      question_number: "24.5",
      question_text: "Il finanziamento è con {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      skippableWithNotSure: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Istituto",
          input_validation: "free_text",
          leads_to: "manager_suoi_finanziamenti"
        }
      }
    }
  ]
};
