
import { Block } from "@/types/form";

// Block 8 - La tua casa
export const block11: Block = {
  block_number: "11",
  block_id: "la_tua_ricerca_casa",
  title: "La tua ricerca casa",
  priority: 200, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "11.1",
      question_id: "prezzo_casa_ricerca",
      question_text: "Sto cercando una casa dal valore indicativo di {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Prezzo",
          leads_to: "localizzazione_immobile_ricerca",
          input_validation: "euro"
        }
      }
    },
    {
        question_number: "11.2",
        question_id: "localizzazione_immobile_ricerca",
        question_text: "La proprietà si trova a {{placeholder1}}, CAP {{placeholder2}}.",
        leads_to_placeholder_priority: "placeholder2",
        placeholders: {
          placeholder1: {
            type: "input",
            input_type: "text",
            placeholder_label: "Città",
            input_validation: "city"
          },
          placeholder2: {
            type: "input",
            input_type: "text",
            placeholder_label: "CAP",
            leads_to: "tipologia_acquisto_ricerca",
            input_validation: "cap"
          }
        }
      },
      {
        question_number: "11.3",
        question_id: "tipologia_acquisto_ricerca",
        question_text: "La tipologia di acquisto è {{placeholder1}}",
        leads_to_placeholder_priority: "placeholder1",
        placeholders: {
          placeholder1: {
            type: "select",
            options: [
              {"id": "classico", "label": "un acquisto classico dal proprietario", "leads_to": "venditore_ricerca"},
              {"id": "nuova_costruzione", "label": "una casa mai abitata, appena costruita", "leads_to": "venditore_ricerca"},
              {"id": "in_costruzione", "label": "acquisto durante la costruzione", "leads_to": "venditore_ricerca"},
              {"id": "terreno", "label": "terreno e progetto di costruzione", "leads_to": "venditore_ricerca"},
              {"id": "su_progetto", "label": "su progetto di costruzione", "leads_to": "venditore_ricerca"},
              {"id": "non_lo_so_ricerca_acquisto", "label": "non lo so", "leads_to": "venditore_ricerca"}
            ]
          }
        }
      },
      {
        question_number: "11.4",
        question_id: "venditore_ricerca",
        question_text: "Compro la casa da una {{placeholder1}}",
        leads_to_placeholder_priority: "placeholder1",
        placeholders: {
          placeholder1: {
            type: "select",
            options: [
              {"id": "fisica", "label": "persona fisica", "leads_to": "next_block"},
              {"id": "societa", "label": "società o ditta", "leads_to": "next_block"}
            ]
          }
        }
      }
     ]
    };
