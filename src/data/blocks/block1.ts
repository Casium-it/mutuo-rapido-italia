
import { Block } from "@/types/form";

// Block 1 - Introduzione
export const block1: Block = {
  block_number: "1",
  block_id: "introduzione",
  title: "Introduzione",
  default_active: true,
  questions: [
    {
      question_number: "1.1",
      question_id: "soggetto_acquisto",
      question_text: "Voglio comprare casa {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "solo", label: "da solo", leads_to: "finalita_acquisto" },
            { id: "cointestatario", label: "con un cointestatario", leads_to: "finalita_acquisto", add_block: "cointestatario" },
            { id: "societa", label: "con una società", leads_to: "finalita_acquisto" }
          ]
        }
      }
    },
    {
      question_number: "1.2",
      question_id: "finalita_acquisto",
      question_text: "L'acquisto è per {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "prima_casa", "label": "una prima casa", "leads_to": "localizzazione_immobile"},
            {"id": "seconda_casa", "label": "una seconda casa", "leads_to": "localizzazione_immobile"},
            {"id": "affitto", "label": "una proprietà da affittare", "leads_to": "localizzazione_immobile"},
            {"id": "commerciale", "label": "un progetto commerciale", "leads_to": "localizzazione_immobile"},
            {"id": "speciale", "label": "un progetto speciale", "leads_to": "localizzazione_immobile"}
          ]
        }
      }
    },
    {
      question_number: "1.3",
      question_id: "localizzazione_immobile",
      question_text: "La proprietà si trova a {{placeholder1}}, {{placeholder2}}",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Città"
        },
        placeholder2: {
          type: "input",
          input_type: "text",
          placeholder_label: "CAP",
          leads_to: "tipologia_acquisto"
        }
      }
    },
    {
      question_number: "1.4",
      question_id: "tipologia_acquisto",
      question_text: "La tipologia di acquisto è {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "classico", "label": "un acquisto classico dal proprietario", "leads_to": "venditore"},
            {"id": "nuova_costruzione", "label": "una casa mai abitata, appena costruita", "leads_to": "venditore"},
            {"id": "in_costruzione", "label": "acquisto durante la costruzione", "leads_to": "venditore"},
            {"id": "terreno", "label": "terreno e progetto di costruzione", "leads_to": "venditore"},
            {"id": "su_progetto", "label": "su progetto di costruzione", "leads_to": "venditore"}
          ]
        }
      }
    },
    {
      question_number: "1.5",
      question_id: "venditore",
      question_text: "Compro la casa da una {{placeholder1}}",
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
