import { Block } from "@/types/form";

// Block 8 - La tua casa
export const block11: Block = {
  block_number: "12",
  block_id: "la_casa_individuata",
  title: "La casa individuata",
  priority: 300, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "12.1",
      question_id: "prezzo_casa_individuata",
      question_text: "La richiesta per la casa individuata è di {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Prezzo annuncio",
          leads_to: "localizzazione_immobile_individuato",
          input_validation: "euro"
        }
      }
    },
    {
        question_number: "12.2",
        question_id: "localizzazione_immobile_individuato",
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
            leads_to: "tipologia_acquisto_individuato",
            input_validation: "cap"
          }
        }
      },
      {
        question_number: "12.3",
        question_id: "tipologia_acquisto_individuato",
        question_text: "La tipologia del potenziale acquisto è {{placeholder1}}",
        leads_to_placeholder_priority: "placeholder1",
        placeholders: {
          placeholder1: {
            type: "select",
            options: [
              {"id": "classico", "label": "un acquisto classico dal proprietario", "leads_to": "venditore_immobile_individuato"},
              {"id": "nuova_costruzione", "label": "una casa mai abitata, appena costruita", "leads_to": "venditore_immobile_individuato"},
              {"id": "in_costruzione", "label": "acquisto durante la costruzione", "leads_to": "venditore_immobile_individuato"},
              {"id": "terreno", "label": "terreno e progetto di costruzione", "leads_to": "venditore_immobile_individuato"},
              {"id": "su_progetto", "label": "su progetto di costruzione", "leads_to": "venditore_immobile_individuato"}
            ]
          }
        }
      },
      {
        question_number: "12.4",
        question_id: "venditore_immobile_individuato",
        question_text: "La casa è attualmente posseduta da una {{placeholder1}}",
        leads_to_placeholder_priority: "placeholder1",
        placeholders: {
          placeholder1: {
            type: "select",
            options: [
              {"id": "fisica", "label": "persona fisica", "leads_to": "classe_energetica_immobile_individuato"},
              {"id": "societa", "label": "società o ditta", "leads_to": "classe_energetica_immobile_individuato"}
            ]
          }
        }
      },
      {
        question_number: "12.5",
        question_id: "classe_energetica_immobile_individuato",
        question_text: "La casa è una classe energetica {{placeholder1}}",
        leads_to_placeholder_priority: "placeholder1",
        placeholders: {
          placeholder1: {
            type: "select",
            options: [
              { id: "classe_a", label: "A", leads_to: "agenzia_intermediaria_immobile_individuato" },
              { id: "classe_b", label: "B", leads_to: "agenzia_intermediaria_immobile_individuato" },
              { id: "classe_c", label: "C", leads_to: "agenzia_intermediaria_immobile_individuato" },
              { id: "classe_d", label: "D", leads_to: "agenzia_intermediaria_immobile_individuato" },
              { id: "classe_e_f_g", label: "E,F,G...", leads_to: "agenzia_intermediaria_immobile_individuato" },
              { id: "classe_non_so", label: "non lo so", leads_to: "agenzia_intermediaria_immobile_individuato" }
            ]
          }
        }
      },
      {
        question_number: "12.6",
        question_id: "agenzia_intermediaria_immobile_individuato",
        question_text: "Il venditore {{placeholder1}} ad un'agenzia immobiliare intermediaria",
        leads_to_placeholder_priority: "placeholder1",
        placeholders: {
          placeholder1: {
            type: "select",
            options: [
              { id: "si affida", label: "si affida", leads_to: "costo_agenzia_immobile_individuato" },
              { id: "non_si_affida", label: "non si affida", leads_to: "next_block" }
            ]
          }
        }
      },
      {
        question_number: "12.7",
        question_id: "costo_agenzia_immobile_individuato",
        question_text: "che costerà circa {{placeholder1}} euro",
        leads_to_placeholder_priority: "placeholder1",
        placeholders: {
          placeholder1: {
            type: "input",
            input_type: "number",
            placeholder_label: "Costo agenzia",
            leads_to: "next_block",
            input_validation: "euro"
          }
        }
      }
     ]
    };
