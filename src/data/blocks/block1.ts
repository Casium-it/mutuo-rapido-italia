
import { Block } from "@/types/form";

// Block 1 - Introduzione
export const block1: Block = {
  block_number: "1",
  block_id: "introduzione",
  title: "Introduzione",
  priority: 10, // Priorità aggiunta
  default_active: true,
  questions: [
     {
      question_id: "income_type",
      question_number: "1.1",
      question_text: "Che tipo di reddito aggiuntivo hai?",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "rental", label: "Reddito da affitto", leads_to: "soggetto_acquisto" },
            { id: "freelance", label: "Lavoro autonomo", leads_to: "soggetto_acquisto" },
            { id: "child_support", label: "Mantenimento figli", leads_to: "soggetto_acquisto" },
            { id: "allowance", label: "Indennità", leads_to: "soggetto_acquisto" },
            { id: "dividends", label: "Dividendi", leads_to: "soggetto_acquisto" },
            { id: "pension", label: "Pensione", leads_to: "soggetto_acquisto" },
            { id: "other", label: "Altro", leads_to: "soggetto_acquisto" }
          ]
        }
      }
    },
    {
      question_number: "1.1",
      question_id: "soggetto_acquisto",
      question_text: "Voglio comprare casa {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
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
      leads_to_placeholder_priority: "placeholder1",
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
      question_text: "La {{placeholder3}} proprietà si trova a {{placeholder1}}, {{placeholder2}} ooo oooo o o o o {{placeholder4}}",
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
          leads_to: "tipologia_acquisto",
          input_validation: "cap"
        },
        placeholder3: {
          type: "select",
          options: [
            {"id": "classico", "label": "un acquisto classico dal proprietario", "leads_to": "venditore"},
            {"id": "nuova_costruzione", "label": "una casa mai abitata, appena costruita", "leads_to": "venditore"},
            {"id": "in_costruzione", "label": "acquisto durante la costruzione", "leads_to": "venditore"},
            {"id": "terreno", "label": "terreno e progetto di costruzione", "leads_to": "venditore"},
            {"id": "su_progetto", "label": "su progetto di costruzione", "leads_to": "venditore"}
          ]
        },
        placeholder4: {
          type: "select",
          options: [
            {"id": "fisica", "label": "persona fisica", "leads_to": "next_block"},
            {"id": "societa", "label": "società o ditta", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "1.4",
      question_id: "tipologia_acquisto",
      question_text: "La tipologia di acquisto è {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
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
