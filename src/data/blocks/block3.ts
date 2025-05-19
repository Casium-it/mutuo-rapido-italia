import { Block } from "@/types/form";

// Block 3 - La tua professione
export const block3: Block = {
  block_number: "3",
  block_id: "la_tua_professione",
  title: "La tua professione",
  priority: 700,
  default_active: true,
  questions: [
    {
      question_number: "3.1",
      question_id: "categoria_professionale",
      question_text: "La tua categoria professionale è {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "impiegato_privato", "label": "impiegato nel settore privato", "leads_to": "tipo_contratto", "add_block": "reddito_principale"},
            {"id": "impiegato_pubblico", "label": "impiegato nel settore pubblico", "leads_to": "tipo_contratto", "add_block": "reddito_principale"},
            {"id": "lavoratore_autonomo", "label": "lavoratore autonomo", "leads_to": "tipo_autonomo", "add_block": "reddito_lavoro_autonomo"},
            {"id": "pensionato", "label": "pensionato", "leads_to": "anno_pensione"},
            {"id": "studente", "label": "studente", "leads_to": "periodo_studio"},
            {"id": "disoccupato", "label": "disoccupato", "leads_to": "stato_disoccupazione"},
            {"id": "altro", "label": "altro", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "3.2",
      question_id: "tipo_contratto",
      question_text: "Il mio attuale contratto è {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "indeterminato", "label": "a tempo indeterminato", "leads_to": "posizione_ricoperta"},
            {"id": "determinato", "label": "a tempo determinato", "leads_to": "scadenza_contratto"},
            {"id": "apprendistato", "label": "apprendistato", "leads_to": "scadenza_contratto"},
            {"id": "tirocinio", "label": "tirocinio", "leads_to": "scadenza_contratto"}
          ]
        }
      }
    },
    {
      question_number: "3.3",
      question_id: "posizione_ricoperta",
      question_text: "La posizione che ricopro è di {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "quadro", "label": "quadro / amministratore / dirigente", "leads_to": "periodo_prova"},
            {"id": "impiegato", "label": "impiegato / operaio / altro", "leads_to": "periodo_prova"}
          ]
        }
      }
    },
    {
      question_number: "3.4",
      question_id: "periodo_prova",
      question_text: "Il periodo di prova è {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "corso", "label": "ancora in corso", "leads_to": "scadenza_contratto"},
            {"id": "finito", "label": "finito", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "3.5",
      question_id: "scadenza_contratto",
      question_text: "in scadenza nel {{placeholder1}} / {{placeholder2}}",
      inline: true,
      leads_to_placeholder_priority: "placeholder2",
      placeholders: {
        placeholder1: {
          type: "input", 
          input_type: "text", 
          placeholder_label: "Mese", 
          leads_to: "probabilita_rinnovo",
          input_validation: "month"
        },
        placeholder2: {
          type: "input", 
          input_type: "number", 
          placeholder_label: "Anno", 
          leads_to: "probabilita_rinnovo",
          input_validation: "year"
        }
      }
    },
    {
      question_number: "3.6",
      question_id: "probabilita_rinnovo",
      question_text: "con {{placeholder1}} possibilità di rinnovo o assunzione indeterminata",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "nessuna", "label": "nessuna possibilità", "leads_to": "next_block"},
            {"id": "bassa", "label": "bassa probabilità", "leads_to": "next_block"},
            {"id": "alta", "label": "alta probabilità", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "3.7",
      question_id: "tipo_autonomo",
      question_text: "La tua professione è {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "partita_iva", "label": "Partita IVA", "leads_to": "anno_autonomo"},
            {"id": "azienda", "label": "Proprietario d'azienda", "leads_to": "anno_autonomo"},
            {"id": "investitore", "label": "Investitore", "leads_to": "anno_autonomo"},
            {"id": "occasionale", "label": "Lavoratore occasionale", "leads_to": "next_block"},
            {"id": "altro_autonomo", "label": "Altro", "leads_to": "input_altro_autonomo"}
          ]
        }
      }
    },
    {
      question_number: "3.7.1",
      question_id: "input_altro_autonomo",
      question_text: "Inserisci la tua professione",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Professione",
          leads_to: "anno_autonomo",
          input_validation: "free_text"
        }
      }
    },
    {
      question_number: "3.8",
      question_id: "anno_autonomo",
      question_text: "Sei un lavoratore autonomo dal {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          leads_to: "next_block",
          input_validation: "year"
        }
      }
    },
    {
      question_number: "3.9",
      question_id: "anno_pensione",
      question_text: "Sono andato in pensione nel {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          leads_to: "reddito_pensione",
          input_validation: "year"
        }
      }
    },
    {
      question_number: "3.9.1",
      question_id: "reddito_pensione",
      question_text: "e percepisco una pensione mensile di {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "valore",
          leads_to: "next_block",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "3.10",
      question_id: "periodo_studio",
      question_text: "Sei studente dal {{placeholder1}} e finirai nel {{placeholder2}}",
      leads_to_placeholder_priority: "placeholder2",
      placeholders: {
        placeholder1: {
          type: "input", 
          input_type: "number", 
          placeholder_label: "Anno inizio", 
          leads_to: "next_block",
          input_validation: "year"
        },
        placeholder2: {
          type: "input", 
          input_type: "number", 
          placeholder_label: "Anno fine", 
          leads_to: "next_block",
          input_validation: "year"
        }
      }
    },
    {
      question_number: "3.11",
      question_id: "stato_disoccupazione",
      question_text: "Sei disoccupato dal {{placeholder1}}",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input", 
          input_type: "number", 
          placeholder_label: "Anno", 
          leads_to: "ricerca_lavoro",
          input_validation: "year"
        }
      }
    },
    {
      question_number: "3.12",
      question_id: "ricerca_lavoro",
      question_text: "e attualmente {{placeholder1}} lavoro",
      inline: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "sto_cercando", "label": "sto cercando", "leads_to": "next_block"},
            {"id": "non_cerco", "label": "non sto cercando", "leads_to": "next_block"}
          ]
        }
      }
    }
  ]
};
