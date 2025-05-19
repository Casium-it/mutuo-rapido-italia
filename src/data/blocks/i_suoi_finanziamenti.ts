import { Block } from "@/types/form";

// Block 27 - I suoi finanziamenti
export const i_suoi_finanziamenti: Block = {
  block_number: "27",
  block_id: "i_suoi_finanziamenti",
  title: "I suoi finanziamenti",
  priority: 1600, // Priorità aggiunta
  default_active: false,
  questions: [
    {
      question_number: "27.1",
      question_id: "presenza_finanziamenti_coint",
      question_text: "Ad oggi {{placeholder1}} finanziamenti aperti",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {id: "ha", label: "ha", add_block: "manager_finanziamenti_coint", leads_to: "next_block"},
            {id: "non_ha", label: "non ha", leads_to: "next_block"}
          ]
        }
      }
    }
  ]
};
