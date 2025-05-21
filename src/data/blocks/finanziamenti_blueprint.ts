
import { Block } from "@/types/form";

export const finanziamenti_blueprint: Block = {
  block_number: "7D",
  block_id: "finanziamenti_blueprint{copyNumber}",
  title: "Dettagli finanziamento",
  priority: 71,
  multiBlock: true,
  invisible: true,
  questions: [
    {
      question_id: "financing_type{copyNumber}",
      question_number: "14.1",
      question_text: "Ho un finanziamento di tipo {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "personal_loan", label: "Prestito personale", leads_to: "finanziamenti_importo{copyNumber}" },
            { id: "car_loan", label: "Prestito auto", leads_to: "finanziamenti_importo{copyNumber}" },
            { id: "credit_card", label: "Carta di credito", leads_to: "finanziamenti_importo{copyNumber}" },
            { id: "mortgage", label: "Mutuo", leads_to: "finanziamenti_importo{copyNumber}" },
            { id: "other", label: "Altro", leads_to: "finanziamenti_importo{copyNumber}" }
          ]
        }
      }
    },
    {
      question_id: "finanziamenti_importo{copyNumber}",
      question_number: "14.2",
      question_text: "L'importo della rata mensile è di {{placeholder1}}",
      question_notes: "Indica l'importo della rata mensile che paghi attualmente",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          input_validation: "euro",
          leads_to: "remaining_amount{copyNumber}"
        }
      }
    },
    {
      question_id: "remaining_amount{copyNumber}",
      question_number: "14.3",
      question_text: "Il capitale residuo è di {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo residuo",
          input_validation: "euro",
          leads_to: "financing_end_date{copyNumber}"
        }
      }
    },
    {
      question_id: "financing_end_date{copyNumber}",
      question_number: "14.4",
      question_text: "Terminerò di pagare questo finanziamento {{placeholder1}}, {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      inline: false,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "gennaio", label: "Gennaio", leads_to: "financing_institution{copyNumber}" },
            { id: "febbraio", label: "Febbraio", leads_to: "financing_institution{copyNumber}" },
            { id: "marzo", label: "Marzo", leads_to: "financing_institution{copyNumber}" },
            { id: "aprile", label: "Aprile", leads_to: "financing_institution{copyNumber}" },
            { id: "maggio", label: "Maggio", leads_to: "financing_institution{copyNumber}" },
            { id: "giugno", label: "Giugno", leads_to: "financing_institution{copyNumber}" },
            { id: "luglio", label: "Luglio", leads_to: "financing_institution{copyNumber}" },
            { id: "agosto", label: "Agosto", leads_to: "financing_institution{copyNumber}" },
            { id: "settembre", label: "Settembre", leads_to: "financing_institution{copyNumber}" },
            { id: "ottobre", label: "Ottobre", leads_to: "financing_institution{copyNumber}" },
            { id: "novembre", label: "Novembre", leads_to: "financing_institution{copyNumber}" },
            { id: "dicembre", label: "Dicembre", leads_to: "financing_institution{copyNumber}" }
          ]
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          input_validation: "year",
          leads_to: "financing_institution{copyNumber}"
        }
      }
    },
    {
      question_id: "financing_institution{copyNumber}",
      question_number: "14.5",
      question_text: "Il finanziamento è con {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Nome istituto",
          input_validation: "free_text",
          leads_to: "manager_finanziamenti"  // Questo punta direttamente alla domanda MultiBlockManager
        }
      }
    }
  ]
};
