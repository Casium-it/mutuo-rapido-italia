
import { Block } from "@/types/form";

export const introduzione: Block = {
  block_number: "1",
  block_id: "introduzione",
  title: "Introduzione",
  priority: 100, // Priorità aggiunta
  default_active: true,
  questions: [
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
            { id: "societa", label: "con una società", leads_to: "stop_flow"}
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
            {"id": "prima_casa", "label": "una prima casa", "leads_to": "next_block"},
            {"id": "seconda_casa", "label": "una seconda casa", "leads_to": "next_block"},
            {"id": "affitto", "label": "una proprietà da affittare", "leads_to": "next_block"},
            {"id": "commerciale", "label": "un progetto commerciale", "leads_to": "stop_flow"},
            {"id": "speciale", "label": "un progetto speciale", "leads_to": "stop_flow"}
          ]
        }
      }
    },
  ]
};
