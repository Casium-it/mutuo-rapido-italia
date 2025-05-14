
import { Block } from "@/types/form";

// Block 10 - Conclusione
export const block10: Block = {
  block_number: "10",
  block_id: "conclusione",
  title: "Conclusione",
  priority: 100, // Priorità aggiunta
  default_active: true,
  questions: [
    {
      question_number: "10.1",
      question_id: "anticipo_disponibile",
      question_text: "Ho {{placeholder1}} euro da usare per l'anticipo",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo anticipo",
          leads_to: "saldo_rimanente"
        }
      }
    },
    {
      question_number: "10.2",
      question_id: "saldo_rimanente",
      question_text: "Dopo aver dato l'anticipo ho a disposizione {{placeholder1}} euro",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Disponibilità residua",
          leads_to: "next_block"
        }
      }
    }
  ]
};
