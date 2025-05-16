
import { Block } from "@/types/form";

// Block 6 - Reddito secondario
export const block6: Block = {
  block_number: "6",
  block_id: "reddito_secondario",
  title: "Reddito secondario",
  priority: 60, // Priorità aggiunta
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
            { id: "ricevo", label: "ricevo", leads_to: "multiple_redditi_secondari" },
            { id: "non_ricevo", label: "non ricevo", leads_to: "next_block" }
          ]
        }
      }
    },
    {
      question_number: "6.2",
      question_id: "multiple_redditi_secondari",
      question_text: "Inserisci le fonti di reddito aggiuntivo che ricevi",
      leads_to_placeholder_priority: "subblock_redditi",
      placeholders: {
        subblock_redditi: {
          type: "subblock",
          repeatable: true,
          repeat_label: "Aggiungi un'altra fonte di reddito",
          placeholder_label: "Le tue fonti di reddito aggiuntivo",
          leads_to: "next_block",
          questions: [
            {
              question_number: "6.2.1",
              question_id: "tipo_reddito_secondario_sub",
              question_text: "Ricevo reddito aggiuntivo da {{placeholder1}}",
              leads_to_placeholder_priority: "placeholder1",
              placeholders: {
                placeholder1: {
                  type: "select",
                  options: [
                    { id: "affitti", label: "affitti", leads_to: "media_reddito_secondario_sub" },
                    { id: "lavoro_autonomo", label: "lavoro autonomo", leads_to: "media_reddito_secondario_sub" },
                    { id: "assegno_minori", label: "assegno minori", leads_to: "media_reddito_secondario_sub" },
                    { id: "supporto_familiari", label: "supporto familiari", leads_to: "media_reddito_secondario_sub" },
                    { id: "dividendi_diritti", label: "dividendi e diritti", leads_to: "media_reddito_secondario_sub" },
                    { id: "altro", label: "altro", leads_to: "altro_descrizione_sub" }
                  ]
                }
              }
            },
            {
              question_number: "6.2.2",
              question_id: "altro_descrizione_sub",
              question_text: "Specifica la fonte del reddito aggiuntivo",
              leads_to_placeholder_priority: "placeholder1",
              placeholders: {
                placeholder1: {
                  type: "input",
                  input_type: "text",
                  placeholder_label: "Descrizione",
                  leads_to: "media_reddito_secondario_sub",
                  input_validation: "free_text"
                }
              }
            },
            {
              question_number: "6.2.3",
              question_id: "media_reddito_secondario_sub",
              question_text: "Negli ultimi 3 anni di media ho ricevuto {{placeholder1}} euro",
              leads_to_placeholder_priority: "placeholder1",
              placeholders: {
                placeholder1: {
                  type: "input",
                  input_type: "number",
                  placeholder_label: "Importo",
                  leads_to: "frequenza_reddito_secondario_sub",
                  input_validation: "euro"
                }
              }
            },
            {
              question_number: "6.2.4",
              question_id: "frequenza_reddito_secondario_sub",
              question_text: "{{placeholder1}}",
              leads_to_placeholder_priority: "placeholder1",
              placeholders: {
                placeholder1: {
                  type: "select",
                  options: [
                    { id: "mensile", label: "mensilmente", leads_to: "lordo_netto_reddito_secondario_sub" },
                    { id: "annuale", label: "annualmente", leads_to: "lordo_netto_reddito_secondario_sub" }
                  ]
                }
              }
            },
            {
              question_number: "6.2.5",
              question_id: "lordo_netto_reddito_secondario_sub",
              question_text: "{{placeholder1}}",
              leads_to_placeholder_priority: "placeholder1",
              placeholders: {
                placeholder1: {
                  type: "select",
                  options: [
                    { id: "netto", label: "netti", leads_to: "stabilita_reddito_secondario_sub" },
                    { id: "lordo", label: "lordi", leads_to: "stabilita_reddito_secondario_sub" }
                  ]
                }
              }
            },
            {
              question_number: "6.2.6",
              question_id: "stabilita_reddito_secondario_sub",
              question_text: "Ritengo questa entrata {{placeholder1}}",
              leads_to_placeholder_priority: "placeholder1",
              placeholders: {
                placeholder1: {
                  type: "select",
                  options: [
                    { id: "volatile", label: "volatile", leads_to: "SUBBLOCK_END" },
                    { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "SUBBLOCK_END" },
                    { id: "quasi_garantita", label: "quasi garantita", leads_to: "SUBBLOCK_END" },
                    { id: "vincolata", label: "vincolata e sicura", leads_to: "SUBBLOCK_END" }
                  ]
                }
              }
            }
          ]
        }
      }
    }
  ]
};
