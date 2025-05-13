import { Block } from "@/types/form";

// Block 0 - Funnel iniziale
export const block0: Block = {
  block_number: "0",
  block_id: "funnel",
  title: "Domanda iniziale",
  default_active: true,
  questions: [
    {
      question_number: "0.1",
      question_id: "fase_mutuo",
      question_text: "A che punto del Mutuo sei? {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "pensiero", label: "Sto pensando di comprare", leads_to: "soggetto_acquisto", add_block: "la_tua_casa" },
            { id: "ricerca", label: "Sto cercando casa", leads_to: "soggetto_acquisto", add_block: "la_tua_casa" },
            { id: "offerta", label: "Ho fatto un'offerta", leads_to: "soggetto_acquisto", add_block: "la_tua_casa" },
            { id: "accettata", label: "Ho un'offerta accettata", leads_to: "soggetto_acquisto", add_block: "la_tua_casa" },
            { id: "surroga", label: "Ho bisogno di una surroga", leads_to: "stop_flow_entry", add_block: "stop_flow" }
          ]
        }
      }
    }
  ]
};

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
      "question_number": "1.2",
      "question_id": "finalita_acquisto",
      "question_text": "L’acquisto è per {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
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
      "question_number": "1.3",
      "question_id": "localizzazione_immobile",
      "question_text": "La proprietà si trova a {{placeholder1}}, {{placeholder2}}",
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "text",
          "placeholder_label": "Città"
        },
        "placeholder2": {
          "type": "input",
          "input_type": "text",
          "placeholder_label": "CAP",
          leads_to: "tipologia_acquisto"
        }
      }
    },
    {
      "question_number": "1.4",
      "question_id": "tipologia_acquisto",
      "question_text": "La tipologia di acquisto è {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
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
      "question_number": "1.5",
      "question_id": "venditore",
      "question_text": "Compro la casa da una {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {"id": "fisica", "label": "persona fisica", "leads_to": "next_block"},
            {"id": "societa", "label": "società o ditta", "leads_to": "next_block"}
          ]
        }
      }
    }
  ]
};

// Block 2 - La tua situazione
export const block2: Block = {
  block_number: "2",
  block_id: "la_tua_situazione",
  title: "La tua situazione",
  default_active: true,
  questions: [
    {
      "question_number": "2.1",
      "question_id": "eta_e_citta",
      "question_text": "Io ho {{placeholder1}} anni e vivo a {{placeholder2}}, {{placeholder3}}",
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "number",
          "placeholder_label": "Età"
        },
        "placeholder2": {
          "type": "input",
          "input_type": "text",
          "placeholder_label": "Città"
        },
        "placeholder3": {
          "type": "input",
          "input_type": "text",
          "placeholder_label": "CAP",
          leads_to: "figli_a_carico"
        }
      }
    },
    {
      "question_number": "2.2",
      "question_id": "figli_a_carico",
      "question_text": "Ho {{placeholder1}} a carico",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {"id": "0", "label": "0 figli", "leads_to": "tipo_abitazione"},
            {"id": "1", "label": "1 figlio", "leads_to": "tipo_abitazione"},
            {"id": "2", "label": "2 figli", "leads_to": "tipo_abitazione"},
            {"id": "3", "label": "3 figli", "leads_to": "tipo_abitazione"},
            {"id": "4+", "label": "4 o più figli", "leads_to": "tipo_abitazione"}
          ]
        }
      }
    },
    {
      "question_number": "2.3",
      "question_id": "tipo_abitazione",
      "question_text": "Attualmente vivo in {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {"id": "affitto", "label": "una casa in affitto", "leads_to": "spesa_affitto"},
            {"id": "aziendale", "label": "un affitto aziendale", "leads_to": "spesa_affitto"},
            {"id": "proprieta", "label": "una casa di mia proprietà", "leads_to": "intenzione_vendita"},
            {"id": "non_pago", "label": "una casa che non pago", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      "question_number": "2.4",
      "question_id": "spesa_affitto",
      "question_text": "che pago {{placeholder1}} euro al mese, compreso condominio",
      "inline": true,
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "number",
          "placeholder_label": "Importo mensile",
          leads_to: "next_block"
        }
      }
    },
    {
      "question_number": "2.5",
      "question_id": "intenzione_vendita",
      "question_text": "che {{placeholder1}} per finanziare il nuovo acquisto",
      "inline": true,
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {
              "id": "vendo",
              "label": "intendo vendere",
              "leads_to": "next_block",
              "add_block": "casa_da_vendere"
            },
            {
              "id": "non_vendo",
              "label": "non intendo vendere",
              "leads_to": "next_block"
            }
          ]
        }
      }
    }
  ]
};

// Block 3 - La tua professione
export const block3: Block = {
  block_number: "3",
  block_id: "la_tua_professione",
  title: "La tua professione",
  default_active: true,
  questions: [
    {
      "question_number": "3.1",
      "question_id": "categoria_professionale",
      "question_text": "La tua categoria professionale è {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
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
      "question_number": "3.2",
      "question_id": "tipo_contratto",
      "question_text": "Il mio attuale contratto è {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {"id": "indeterminato", "label": "a tempo indeterminato", "leads_to": "posizione_ricoperta"},
            {"id": "determinato", "label": "a tempo determinato", "leads_to": "scadenza_contratto"},
            {"id": "apprendistato", "label": "apprendistato", "leads_to": "scadenza_contratto"},
            {"id": "tirocinio", "label": "tirocinio", "leads_to": "scadenza_contratto"}
          ]
        }
      }
    },
    {
      "question_number": "3.3",
      "question_id": "posizione_ricoperta",
      "question_text": "La posizione che ricopro è di {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {"id": "quadro", "label": "quadro / amministratore / dirigente", "leads_to": "periodo_prova"},
            {"id": "impiegato", "label": "impiegato / operaio / altro", "leads_to": "periodo_prova"}
          ]
        }
      }
    },
    {
      "question_number": "3.4",
      "question_id": "periodo_prova",
      "question_text": "Il periodo di prova è {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {"id": "corso", "label": "ancora in corso", "leads_to": "next_block"},
            {"id": "finito", "label": "finito", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      "question_number": "3.5",
      "question_id": "scadenza_contratto",
      "question_text": "in scadenza nel {{placeholder1}} / {{placeholder2}}",
      "inline": true,
      "placeholders": {
        "placeholder1": {"type": "input", "input_type": "text", "placeholder_label": "Mese", "leads_to": "probabilita_rinnovo"},
        "placeholder2": {"type": "input", "input_type": "number", "placeholder_label": "Anno", "leads_to": "probabilita_rinnovo"}
      }
    },
    {
      "question_number": "3.6",
      "question_id": "probabilita_rinnovo",
      "question_text": "con {{placeholder1}} possibilità di rinnovo",
      "inline": true,
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {"id": "nessuna", "label": "nessuna possibilità", "leads_to": "posizione_ricoperta"},
            {"id": "bassa", "label": "bassa probabilità", "leads_to": "posizione_ricoperta"},
            {"id": "alta", "label": "alta probabilità", "leads_to": "posizione_ricoperta"}
          ]
        }
      }
    },
    {
      "question_number": "3.7",
      "question_id": "tipo_autonomo",
      "question_text": "La tua professione è {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {"id": "partita_iva", "label": "Partita IVA", "leads_to": "anno_autonomo"},
            {"id": "azienda", "label": "Proprietario d’azienda", "leads_to": "anno_autonomo"},
            {"id": "investitore", "label": "Investitore", "leads_to": "anno_autonomo"},
            {"id": "occasionale", "label": "Lavoratore occasionale", "leads_to": "next_block"},
            {"id": "altro_autonomo", "label": "Altro", "leads_to": "input_altro_autonomo"}
          ]
        }
      }
    },
    {
      "question_number": "3.7.1",
      "question_id": "input_altro_autonomo",
      "question_text": "Inserisci la tua professione",
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "text",
          "placeholder_label": "Professione",
          "leads_to": "anno_autonomo"
        }
      }
    },
    {
      "question_number": "3.8",
      "question_id": "anno_autonomo",
      "question_text": "Sei un lavoratore autonomo dal {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "number",
          "placeholder_label": "Anno",
          "leads_to": "next_block"
        }
      }
    },
    {
      "question_number": "3.9",
      "question_id": "anno_pensione",
      "question_text": "Sei andato in pensione nel {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "number",
          "placeholder_label": "Anno",
          "leads_to": "next_block"
        }
      }
    },
    {
      "question_number": "3.10",
      "question_id": "periodo_studio",
      "question_text": "Sei studente dal {{placeholder1}} e finirai nel {{placeholder2}}",
      "placeholders": {
        "placeholder1": {"type": "input", "input_type": "number", "placeholder_label": "Anno inizio", "leads_to": "next_block"},
        "placeholder2": {"type": "input", "input_type": "number", "placeholder_label": "Anno fine", "leads_to": "next_block"}
      }
    },
    {
      "question_number": "3.11",
      "question_id": "stato_disoccupazione",
      "question_text": "Sei disoccupato dal {{placeholder1}}",
      "placeholders": {
        "placeholder1": {"type": "input", "input_type": "number", "placeholder_label": "Anno", "leads_to": "ricerca_lavoro"}
      }
    },
    {
      "question_number": "3.12",
      "question_id": "ricerca_lavoro",
      "question_text": "e attualmente {{placeholder1}} lavoro",
      "inline": true,
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {"id": "sto_cercando", "label": "sto cercando", "leads_to": "next_block"},
            {"id": "non_cerco", "label": "non sto cercando", "leads_to": "next_block"}
          ]
        }
      }
    }
  ]
};

// Block 7 - Finanziamenti
export const block7: Block = {
  block_number: "7",
  block_id: "finanziamenti",
  title: "I tuoi finanziamenti",
  default_active: true,
  questions: [
    {
      "question_number": "7.1",
      "question_id": "presenza_finanziamenti",
      "question_text": "Ad oggi {{placeholder1}} finanziamenti aperti",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {
              "id": "ho",
              "label": "ho",
              "leads_to": "tipo_finanziamento"
            },
            {
              "id": "non_ho",
              "label": "non ho",
              "leads_to": "next_block"
            }
          ]
        }
      }
    },
    {
      "question_number": "7.2",
      "question_id": "tipo_finanziamento",
      "question_text": "Ho un finanziamento per {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {
              "id": "mutuo",
              "label": "un altro mutuo",
              "leads_to": "oggetto_finanziamento"
            },
            {
              "id": "prestito_personale",
              "label": "un prestito personale",
              "leads_to": "oggetto_finanziamento"
            }
          ]
        }
      }
    },
    {
      "question_number": "7.3",
      "question_id": "oggetto_finanziamento",
      "question_text": "Per questo finanziamento ho dei pagamenti per {{placeholder1}}",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {
              "id": "macchina",
              "label": "la macchina",
              "leads_to": "importo_finanziamento"
            },
            {
              "id": "leasing",
              "label": "un leasing",
              "leads_to": "importo_finanziamento"
            },
            {
              "id": "altro",
              "label": "altro",
              "leads_to": "oggetto_finanziamento_altro"
            }
          ]
        }
      }
    },
    {
      "question_number": "7.3.1",
      "question_id": "oggetto_finanziamento_altro",
      "question_text": "Specifica la destinazione del finanziamento",
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "text",
          "placeholder_label": "Descrizione",
          "leads_to": "importo_finanziamento"
        }
      }
    },
    {
      "question_number": "7.4",
      "question_id": "importo_finanziamento",
      "question_text": "di {{placeholder1}} euro",
      "inline": true,
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "number",
          "placeholder_label": "Importo",
          "leads_to": "frequenza_rata"
        }
      }
    },
    {
      "question_number": "7.5",
      "question_id": "frequenza_rata",
      "question_text": "{{placeholder1}}",
      "inline": true,
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {
              "id": "mensili",
              "label": "mensili",
              "leads_to": "data_fine_finanziamento"
            },
            {
              "id": "ogni_2_mesi",
              "label": "ogni 2 mesi",
              "leads_to": "data_fine_finanziamento"
            },
            {
              "id": "ogni_3_mesi",
              "label": "ogni 3 mesi",
              "leads_to": "data_fine_finanziamento"
            },
            {
              "id": "ogni_6_mesi",
              "label": "ogni 6 mesi",
              "leads_to": "data_fine_finanziamento"
            },
            {
              "id": "annuali",
              "label": "annuali",
              "leads_to": "data_fine_finanziamento"
            }
          ]
        }
      }
    },
    {
      "question_number": "7.6",
      "question_id": "data_fine_finanziamento",
      "question_text": "che finiranno a {{placeholder1}} / {{placeholder2}}",
      "inline": true,
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "text",
          "placeholder_label": "Mese",
          "leads_to": "storico_pagamento"
        },
        "placeholder2": {
          "type": "input",
          "input_type": "number",
          "placeholder_label": "Anno",
          "leads_to": "storico_pagamento"
        }
      }
    },
    {
      "question_number": "7.7",
      "question_id": "storico_pagamento",
      "question_text": "Per questo finanziamento ho pagato {{placeholder1}} regolarmente",
      "placeholders": {
        "placeholder1": {
          "type": "select",
          "options": [
            {
              "id": "sempre",
              "label": "sempre",
              "leads_to": "tipo_finanziamento"
            },
            {
              "id": "quasi_sempre",
              "label": "quasi sempre",
              "leads_to": "tipo_finanziamento"
            },
            {
              "id": "poco",
              "label": "poco",
              "leads_to": "tipo_finanziamento"
            }
          ]
        }
      }
    }
  ]
};

// Block 10 - Conclusione
export const block10: Block = {
  block_number: "10",
  block_id: "conclusione",
  title: "Conclusione",
  default_active: true,
  questions: [
    {
      "question_number": "10.1",
      "question_id": "anticipo_disponibile",
      "question_text": "Ho {{placeholder1}} euro da usare per l'anticipo",
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "number",
          "placeholder_label": "Importo anticipo",
          "leads_to": "saldo_rimanente"
        }
      }
    },
    {
      "question_number": "10.2",
      "question_id": "saldo_rimanente",
      "question_text": "Dopo aver dato l'anticipo ho a disposizione {{placeholder1}} euro",
      "placeholders": {
        "placeholder1": {
          "type": "input",
          "input_type": "number",
          "placeholder_label": "Disponibilità residua",
          "leads_to": "next_block"
        }
      }
    }
  ]
};

// List of all blocks (including conditional ones)
export const allBlocks: Block[] = [
  block0,
  block1,
  block2,
  block3,
  block7,
  block10,
  // Add other blocks as needed
];
