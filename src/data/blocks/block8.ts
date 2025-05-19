import { Block } from "@/types/form";

// Block 8 - La tua casa
export const block8: Block = {
  block_number: "8",
  block_id: "la_tua_offerta",
  title: "La tua offerta",
  priority: 400, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "8.1",
      question_id: "offerta_casa",
      question_text: "Ho fatto un'offerta dal valore di {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Valore offerta",
          leads_to: "localizzazione_immobile_offerta",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "8.2",
      question_id: "localizzazione_immobile_offerta",
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
          leads_to: "tipologia_acquisto_offerta",
          input_validation: "cap"
        }
      }
    },
    {
      question_number: "8.3",
      question_id: "tipologia_acquisto_offerta",
      question_text: "La tipologia del potenziale acquisto è {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "classico", "label": "un acquisto classico dal proprietario", "leads_to": "venditore_immobile_offerta"},
            {"id": "nuova_costruzione", "label": "una casa mai abitata, appena costruita", "leads_to": "venditore_immobile_offerta"},
            {"id": "in_costruzione", "label": "acquisto durante la costruzione", "leads_to": "venditore_immobile_offerta"},
            {"id": "terreno", "label": "terreno e progetto di costruzione", "leads_to": "venditore_immobile_offerta"},
            {"id": "su_progetto", "label": "su progetto di costruzione", "leads_to": "venditore_immobile_offerta"}
          ]
        }
      }
    },
    {
      question_number: "8.4",
      question_id: "venditore_immobile_offerta",
      question_text: "La casa è attualmente posseduta da una {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "fisica", "label": "persona fisica", "leads_to": "classe_energetica_immobile_offerta"},
            {"id": "societa", "label": "società o ditta", "leads_to": "classe_energetica_immobile_offerta"}
          ]
        }
      }
    },
    {
      question_number: "8.5",
      question_id: "classe_energetica_immobile_offerta",
      question_text: "La casa è una classe energetica {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "classe_a", label: "A", leads_to: "agenzia_intermediaria_immobile_offerta" },
            { id: "classe_b", label: "B", leads_to: "agenzia_intermediaria_immobile_offerta" },
            { id: "classe_c", label: "C", leads_to: "agenzia_intermediaria_immobile_offerta" },
            { id: "classe_d", label: "D", leads_to: "agenzia_intermediaria_immobile_offerta" },
            { id: "classe_e_f_g", label: "E,F,G...", leads_to: "agenzia_intermediaria_immobile_offerta" },
            { id: "classe_non_so", label: "non lo so", leads_to: "agenzia_intermediaria_immobile_offerta" }
          ]
        }
      }
    },
    {
      question_number: "8.6",
      question_id: "agenzia_intermediaria_immobile_offerta",
      question_text: "Il venditore {{placeholder1}} ad un'agenzia immobiliare intermediaria",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "si affida", label: "si affida", leads_to: "costo_agenzia_immobile_offerta" },
            { id: "non_si_affida", label: "non si affida", leads_to: "next_block" }
          ]
        }
      }
    },
    {
      question_number: "8.7",
      question_id: "costo_agenzia_immobile_offerta",
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
