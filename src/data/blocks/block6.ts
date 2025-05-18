
import { Block } from "@/types/form";

// Block 6 - Reddito secondario
export const block6: Block = {
  block_number: "6",
  block_id: "reddito_secondario",
  title: "Reddito secondario",
  priority: 60,
  default_active: true,
  questions: [
    {
      question_number: "6.1",
      question_id: "presenza_reddito_secondario",
      question_text: "Negli ultimi anni {{placeholder1}} reddito aggiuntivo oltre al principale dichiarato",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "ricevo", label: "ricevo", leads_to: "tipo_reddito_secondario" },
            { id: "non_ricevo", label: "non ricevo", leads_to: "next_block" }
          ]
        }
      }
    },
    {
      question_number: "6.2",
      question_id: "tipo_reddito_secondario",
      question_text: "Ricevo reddito aggiuntivo da {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "affitti", label: "affitti", leads_to: "gestione_redditi_secondari" },
            { id: "lavoro_autonomo", label: "lavoro autonomo", leads_to: "gestione_redditi_secondari" },
            { id: "assegno_minori", label: "assegno minori", leads_to: "gestione_redditi_secondari" },
            { id: "supporto_familiari", label: "supporto familiari", leads_to: "gestione_redditi_secondari" },
            { id: "dividendi_diritti", label: "dividendi e diritti", leads_to: "gestione_redditi_secondari" },
            { id: "altro", label: "altro", leads_to: "altro_descrizione" }
          ]
        }
      }
    },
    {
      question_number: "6.2.1",
      question_id: "altro_descrizione",
      question_text: "Specifica la fonte del reddito aggiuntivo",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Descrizione",
          leads_to: "gestione_redditi_secondari",
          input_validation: "free_text"
        }
      }
    },
    {
      question_number: "6.3",
      question_id: "gestione_redditi_secondari",
      question_text: "Dettagli redditi secondari",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "MultiBlockManager",
          placeholder_label: "Aggiungi i dettagli dei redditi secondari che percepisci",
          add_block_label: "Aggiungi dettagli reddito",
          blockBlueprint: "dettagli_reddito_secondario_{copyNumber}",
          leads_to: "next_block"
        }
      }
    }
  ]
};
