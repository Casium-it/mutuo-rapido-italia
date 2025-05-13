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
      inline: true,
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

// Block 8 - La tua casa
export const block8: Block = {
  block_number: "8",
  block_id: "la_tua_casa",
  title: "La tua casa",
  default_active: false,
  questions: [
    {
      question_number: "8.1",
      question_id: "offerta_casa",
      question_text: "L'offerta della casa individuata è di {{placeholder1}} euro",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Valore offerta",
          leads_to: "classe_energetica"
        }
      }
    },
    {
      question_number: "8.2",
      question_id: "classe_energetica",
      question_text: "La casa è una classe energetica {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "classe_a", label: "A", leads_to: "agenzia_intermediaria" },
            { id: "classe_b", label: "B", leads_to: "agenzia_intermediaria" },
            { id: "classe_c", label: "C", leads_to: "agenzia_intermediaria" },
            { id: "classe_d", label: "D", leads_to: "agenzia_intermediaria" },
            { id: "classe_e_f_g", label: "E,F,G...", leads_to: "agenzia_intermediaria" },
            { id: "classe_non_so", label: "non lo so", leads_to: "agenzia_intermediaria" }
          ]
        }
      }
    },
    {
      question_number: "8.3",
      question_id: "agenzia_intermediaria",
      question_text: "L'acquisto {{placeholder1}} un'agenzia immobiliare intermediaria",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "ha", label: "ha", leads_to: "costo_agenzia" },
            { id: "non_ha", label: "non ha", leads_to: "next_block" }
          ]
        }
      }
    },
    {
      question_number: "8.4",
      question_id: "costo_agenzia",
      question_text: "che costerà circa {{placeholder1}} euro",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Costo agenzia",
          leads_to: "next_block"
        }
      }
    }
  ]
};

// Block 9 - La casa da vendere
export const block9: Block = {
  block_number: "9",
  block_id: "casa_da_vendere",
  title: "La casa da vendere",
  default_active: false,
  questions: [
    {
      question_number: "9.1",
      question_id: "valore_casa_vendita",
      question_text: "Il valore della casa da vendere oggi è circa {{placeholder1}} euro",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Valore stimato",
          leads_to: "presenza_mutuo_casa_vendita"
        }
      }
    },
    {
      question_number: "9.2",
      question_id: "presenza_mutuo_casa_vendita",
      question_text: "La casa attualmente {{placeholder1}} da saldare",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {
              id: "ha_mutuo",
              label: "ha un mutuo",
              leads_to: "dettagli_mutuo_casa_vendita"
            },
            {
              id: "no_mutuo",
              label: "non ha un mutuo",
              leads_to: "next_block"
            }
          ]
        }
      }
    },
    {
      question_number: "9.3",
      question_id: "dettagli_mutuo_casa_vendita",
      question_text: "Al mutuo mancano {{placeholder1}} euro da saldare. Il mutuo aveva un tasso del {{placeholder2}}%, e finirà nel {{placeholder3}}",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo residuo"
        },
        placeholder2: {
          type: "input",
          input_type: "number",
          placeholder_label: "Tasso percentuale"
        },
        placeholder3: {
          type: "input",
          input_type: "number",
          placeholder_label: "Anno",
          leads_to: "next_block"
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

// Block 22 - Cointestatario
export const block22: Block = {
  block_number: "22",
  block_id: "cointestatario",
  title: "Il tuo cointestatario",
  default_active: false,
  questions: [
    {
      question_number: "22.1",
      question_id: "cointestatario_dati",
      question_text: "Il cointestatario ha {{placeholder1}} anni",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Età",
          leads_to: "next_block"
        }
      }
    }
  ]
};

// Block 23 - La sua professione
export const block23: Block = {
  block_number: "23",
  block_id: "la_sua_professione",
  title: "La sua professione",
  default_active: false,
  questions: [
    {
      question_number: "23.1",
      question_id: "categoria_professionale_coint",
      question_text: "La categoria professionale del tuo cointestatario è {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "impiegato_privato", "label": "impiegato nel settore privato", "leads_to": "tipo_contratto_coint", "add_block": "reddito_suo_principale"},
            {"id": "impiegato_pubblico", "label": "impiegato nel settore pubblico", "leads_to": "tipo_contratto_coint", "add_block": "reddito_suo_principale"},
            {"id": "lavoratore_autonomo", "label": "lavoratore autonomo", "leads_to": "tipo_autonomo_coint", "add_block": "reddito_suo_autonomo"},
            {"id": "pensionato", "label": "pensionato", "leads_to": "anno_pensione_coint"},
            {"id": "studente", "label": "studente", "leads_to": "periodo_studio_coint"},
            {"id": "disoccupato", "label": "disoccupato", "leads_to": "stato_disoccupazione_coint"},
            {"id": "altro", "label": "altro", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "23.2",
      question_id: "tipo_contratto_coint",
      question_text: "Il suo attuale contratto è {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "indeterminato", "label": "a tempo indeterminato", "leads_to": "posizione_ricoperta_coint"},
            {"id": "determinato", "label": "a tempo determinato", "leads_to": "scadenza_contratto_coint"},
            {"id": "apprendistato", "label": "un apprendistato", "leads_to": "scadenza_contratto_coint"},
            {"id": "tirocinio", "label": "un tirocinio", "leads_to": "scadenza_contratto_coint"}
          ]
        }
      }
    },
    {
      question_number: "23.3",
      question_id: "posizione_ricoperta_coint",
      question_text: "La posizione che ricopre è di {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "quadro", "label": "quadro / amministratore / dirigente", "leads_to": "periodo_prova_coint"},
            {"id": "impiegato", "label": "impiegato / operaio / altro", "leads_to": "periodo_prova_coint"}
          ]
        }
      }
    },
    {
      question_number: "23.4",
      question_id: "periodo_prova_coint",
      question_text: "Il periodo di prova è {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "corso", "label": "ancora in corso", "leads_to": "next_block"},
            {"id": "finito", "label": "finito", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "23.5",
      question_id: "scadenza_contratto_coint",
      question_text: "in scadenza nel {{placeholder1}} / {{placeholder2}}",
      inline: true,
      placeholders: {
        placeholder1: {"type": "input", "input_type": "text", "placeholder_label": "Mese", "leads_to": "probabilita_rinnovo_coint"},
        placeholder2: {"type": "input", "input_type": "number", "placeholder_label": "Anno", "leads_to": "probabilita_rinnovo_coint"}
      }
    },
    {
      question_number: "23.6",
      question_id: "probabilita_rinnovo_coint",
      question_text: "con {{placeholder1}} possibilità di rinnovo",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "nessuna", "label": "nessuna possibilità", "leads_to": "posizione_ricoperta_coint"},
            {"id": "bassa", "label": "bassa probabilità", "leads_to": "posizione_ricoperta_coint"},
            {"id": "alta", "label": "alta probabilità", "leads_to": "posizione_ricoperta_coint"}
          ]
        }
      }
    },
    {
      question_number: "23.7",
      question_id: "tipo_autonomo_coint",
      question_text: "La professione del tuo cointestatario è {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "partita_iva", "label": "Partita IVA", "leads_to": "anno_autonomo_coint"},
            {"id": "azienda", "label": "Proprietario d'azienda", "leads_to": "anno_autonomo_coint"},
            {"id": "investitore", "label": "Investitore", "leads_to": "anno_autonomo_coint"},
            {"id": "occasionale", "label": "Lavoratore occasionale", "leads_to": "next_block"},
            {"id": "altro_autonomo", "label": "Altro", "leads_to": "input_altro_autonomo_coint"}
          ]
        }
      }
    },
    {
      question_number: "23.7.1",
      question_id: "input_altro_autonomo_coint",
      question_text: "Inserisci la sua professione",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "text",
          placeholder_label: "Professione",
          leads_to: "anno_autonomo_coint"
        }
      }
    },
    {
      question_number: "23.8",
      question_id: "anno_autonomo_coint",
      question_text: "è un lavoratore autonomo dal {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "number",
          placeholder_label: "Anno",
          leads_to: "next_block"
        }
      }
    },
    {
      question_number: "23.9",
      question_id: "anno_pensione_coint",
      question_text: "è andato in pensione nel {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "number",
          placeholder_label: "Anno",
          leads_to: "next_block"
        }
      }
    },
    {
      question_number: "23.10",
      question_id: "periodo_studio_coint",
      question_text: "È studente dal {{placeholder1}} e finirà nel {{placeholder2}}",
      placeholders: {
        placeholder1: {"type": "input", "input_type": "number", "placeholder_label": "Anno inizio", "leads_to": "next_block"},
        placeholder2: {"type": "input", "input_type": "number", "placeholder_label": "Anno fine", "leads_to": "next_block"}
      }
    },
    {
      question_number: "23.11",
      question_id: "stato_disoccupazione_coint",
      question_text: "È disoccupato dal {{placeholder1}}",
      placeholders: {
        placeholder1: {"type": "input", "input_type": "number", "placeholder_label": "Anno", "leads_to": "ricerca_lavoro_coint"}
      }
    },
    {
      question_number: "23.12",
      question_id: "ricerca_lavoro_coint",
      question_text: "e attualmente {{placeholder1}} lavoro",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "sto_cercando", "label": "sta cercando", "leads_to": "next_block"},
            {"id": "non_cerco", "label": "non sta cercando", "leads_to": "next_block"}
          ]
        }
      }
    }
  ]
};

// Block 24 - Reddito lavoro autonomo del cointestatario
export const block24: Block = {
  block_number: "24",
  block_id: "reddito_suo_autonomo",
  title: "Reddito lavoro autonomo del cointestatario",
  default_active: false,
  questions: [
    {
      question_number: "24.1",
      question_id: "guadagno_coint",
      question_text: "Il cointestatario attraverso la sua professione principale guadagna {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "mensilmente", "label": "mensilmente", "leads_to": "importo_lordo_netto_coint"},
            {"id": "annualmente", "label": "annualmente", "leads_to": "importo_lordo_netto_coint"}
          ]
        }
      }
    },
    {
      question_number: "24.2",
      question_id: "importo_lordo_netto_coint",
      question_text: "circa un importo {{placeholder1}}",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "lordo", "label": "lordo", "leads_to": "media_3_anni_coint"},
            {"id": "netto", "label": "netto", "leads_to": "media_3_anni_coint"}
          ]
        }
      }
    },
    {
      question_number: "24.3",
      question_id: "media_3_anni_coint",
      question_text: "di {{placeholder1}} euro, in media negli ultimi 3 anni",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo medio",
          leads_to: "netto_annuo_coint"
        }
      }
    },
    {
      question_number: "24.4",
      question_id: "netto_annuo_coint",
      question_text: "Al netto dei costi legati all'attività e alle tasse che sostiene, annualmente in media gli rimangono {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Netto annuo",
          leads_to: "stabilita_coint"
        }
      }
    },
    {
      question_number: "24.5",
      question_id: "stabilita_coint",
      question_text: "Il cointestatario ritiene che questa media sia {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "molto_stabile", "label": "estremamente stabile", "leads_to": "previsione_prossimo_anno_coint"},
            {"id": "abbastanza_stabile", "label": "abbastanza stabile", "leads_to": "previsione_prossimo_anno_coint"},
            {"id": "abbastanza_volatile", "label": "abbastanza volatile", "leads_to": "previsione_prossimo_anno_coint"},
            {"id": "molto_volatile", "label": "estremamente volatile", "leads_to": "previsione_prossimo_anno_coint"}
          ]
        }
      }
    },
    {
      question_number: "24.6",
      question_id: "previsione_prossimo_anno_coint",
      question_text: "Infatti prevede che l'anno prossimo al netto di tasse e costi per attività avrà {{placeholder1}} euro",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Previsione futura",
          leads_to: "next_block"
        }
      }
    }
  ]
};

// Block 25 - Reddito principale del cointestatario
export const block25: Block = {
  block_number: "25",
  block_id: "reddito_suo_principale",
  title: "Reddito principale del cointestatario",
  default_active: false,
  questions: [
    {
      question_number: "25.1",
      question_id: "busta_paga_periodicita_coint",
      question_text: "Riceve busta paga {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "mensile", "label": "mensile", "leads_to": "busta_paga_importo_coint"},
            {"id": "annuale", "label": "annuale", "leads_to": "busta_paga_importo_coint"}
          ]
        }
      }
    },
    {
      question_number: "25.2",
      question_id: "busta_paga_importo_coint",
      question_text: ", senza straordinari e bonus, di {{placeholder1}} euro",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "busta_paga_lordo_netto_coint"
        }
      }
    },
    {
      question_number: "25.3",
      question_id: "busta_paga_lordo_netto_coint",
      question_text: "L'importo indicato è {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "lordo", "label": "al lordo", "leads_to": "contratto_tredicesime_coint"},
            {"id": "netto", "label": "al netto", "leads_to": "contratto_tredicesime_coint"}
          ]
        }
      }
    },
    {
      question_number: "25.4",
      question_id: "contratto_tredicesime_coint",
      question_text: "Il suo contratto {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "no_13", "label": "non comprende 13º e 14º", "leads_to": "ricezione_bonus_coint"},
            {"id": "solo_13", "label": "comprende la 13º", "leads_to": "ricezione_bonus_coint"},
            {"id": "tredici_quattordici", "label": "comprende 13º e 14º", "leads_to": "ricezione_bonus_coint"}
          ]
        }
      }
    },
    {
      question_number: "25.5",
      question_id: "ricezione_bonus_coint",
      question_text: "Nella sua posizione {{placeholder1}} bonus.",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "riceve", "label": "riceve", "leads_to": "importo_bonus_coint"},
            {"id": "non_riceve", "label": "non riceve", "leads_to": "ricezione_benefit_coint"}
          ]
        }
      }
    },
    {
      question_number: "25.6",
      question_id: "importo_bonus_coint",
      question_text: "Il bonus in media è di {{placeholder1}} euro netti annuali, negli ultimi 3 anni",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "number",
          placeholder_label: "Importo bonus",
          leads_to: "bonus_stabilita_coint"
        }
      }
    },
    {
      question_number: "25.7",
      question_id: "bonus_stabilita_coint",
      question_text: "Il suo bonus è {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "volatile", "label": "volatile", "leads_to": "ricezione_benefit_coint"},
            {"id": "stabile", "label": "abbastanza stabile", "leads_to": "ricezione_benefit_coint"},
            {"id": "garantito", "label": "quasi garantito", "leads_to": "ricezione_benefit_coint"},
            {"id": "pattuito", "label": "pattuito nel contratto", "leads_to": "ricezione_benefit_coint"}
          ]
        }
      }
    },
    {
      question_number: "25.8",
      question_id: "ricezione_benefit_coint",
      question_text: "Nella sua posizione {{placeholder1}} benefit aziendali.",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "riceve", "label": "riceve", "leads_to": "tipologia_benefit_coint"},
            {"id": "non_riceve", "label": "non riceve", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "25.9",
      question_id: "tipologia_benefit_coint",
      question_text: "I suoi benefit sono: {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          multiple: true,
          options: [
            {"id": "buoni_pasto", "label": "buoni pasto", "leads_to": "next_block"},
            {"id": "buoni_carburante", "label": "buoni carburante", "leads_to": "next_block"},
            {"id": "macchina_aziendale", "label": "macchina aziendale", "leads_to": "next_block"},
            {"id": "convenzioni", "label": "convenzioni e sconti", "leads_to": "next_block"},
            {"id": "assicurazioni", "label": "assicurazioni", "leads_to": "next_block"},
            {"id": "pensione_privata", "label": "pensione privata", "leads_to": "next_block"},
            {"id": "altro", "label": "altro", "leads_to": "next_block"}
          ]
        }
      }
    }
  ]
};

// Block 26 - Reddito secondario del cointestatario
export const block26: Block = {
  block_number: "26",
  block_id: "reddito_suo_secondario",
  title: "Il suo reddito secondario",
  default_active: false,
  questions: [
    {
      question_number: "26.1",
      question_id: "presenza_reddito_secondario_coint",
      question_text: "Negli ultimi anni {{placeholder1}} reddito aggiuntivo oltre al principale dichiarato",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "ha_ricevuto", "label": "ha ricevuto", "leads_to": "tipo_reddito_secondario_coint"},
            {"id": "non_ha_ricevuto", "label": "non ha ricevuto", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "26.2",
      question_id: "tipo_reddito_secondario_coint",
      question_text: "Riceve reddito aggiuntivo da {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "affitti", "label": "affitti", "leads_to": "media_reddito_secondario_coint"},
            {"id": "lavoro_autonomo", "label": "lavoro autonomo", "leads_to": "media_reddito_secondario_coint"},
            {"id": "assegno_minori", "label": "assegno minori", "leads_to": "media_reddito_secondario_coint"},
            {"id": "supporto_familiari", "label": "supporto familiari", "leads_to": "media_reddito_secondario_coint"},
            {"id": "dividendi_diritti", "label": "dividendi e diritti", "leads_to": "media_reddito_secondario_coint"},
            {"id": "altro", "label": "altro", "leads_to": "altro_descrizione_coint"}
          ]
        }
      }
    },
    {
      question_number: "26.2.1",
      question_id: "altro_descrizione_coint",
      question_text: "Specifica la fonte del reddito aggiuntivo",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "text",
          placeholder_label: "Descrizione",
          leads_to: "media_reddito_secondario_coint"
        }
      }
    },
    {
      question_number: "26.3",
      question_id: "media_reddito_secondario_coint",
      question_text: "Negli ultimi 3 anni di media ha ricevuto {{placeholder1}} euro",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_reddito_secondario_coint"
        }
      }
    },
    {
      question_number: "26.4",
      question_id: "frequenza_reddito_secondario_coint",
      question_text: "{{placeholder1}}",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "mensile", "label": "mensilmente", "leads_to": "lordo_netto_reddito_secondario_coint"},
            {"id": "annuale", "label": "annualmente", "leads_to": "lordo_netto_reddito_secondario_coint"}
          ]
        }
      }
    },
    {
      question_number: "26.5",
      question_id: "lordo_netto_reddito_secondario_coint",
      question_text: "{{placeholder1}}",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "netto", "label": "netti", "leads_to": "stabilita_reddito_secondario_coint"},
            {"id": "lordo", "label": "lordi", "leads_to": "stabilita_reddito_secondario_coint"}
          ]
        }
      }
    },
    {
      question_number: "26.6",
      question_id: "stabilita_reddito_secondario_coint",
      question_text: "Ritiene questa entrata {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "volatile", "label": "volatile", "leads_to": "data_inizio_reddito_coint"},
            {"id": "abbastanza_stabile", "label": "abbastanza stabile", "leads_to": "data_inizio_reddito_coint"},
            {"id": "quasi_garantita", "label": "quasi garantita", "leads_to": "data_inizio_reddito_coint"},
            {"id": "vincolata", "label": "vincolata e sicura", "leads_to": "data_inizio_reddito_coint"}
          ]
        }
      }
    },
    {
      question_number: "26.7",
      question_id: "data_inizio_reddito_coint",
      question_text: "Riceve questa entrata dal {{placeholder1}} / {{placeholder2}}",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "text",
          placeholder_label: "Mese",
          leads_to: "data_fine_reddito_coint"
        },
        placeholder2: {
          type: "input",
          input_type": "number",
          placeholder_label: "Anno",
          leads_to: "data_fine_reddito_coint"
        }
      }
    },
    {
      question_number: "26.8",
      question_id: "data_fine_reddito_coint",
      question_text: "e continuerà a riceverla sicuramente fino al {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "text",
          placeholder_label: "Anno o 'non lo sa'",
          leads_to: "tipo_reddito_secondario_coint"
        }
      }
    }
  ]
};

// Block 27 - I suoi finanziamenti
export const block27: Block = {
  block_number: "27",
  block_id: "finanziamenti_suo",
  title: "I suoi finanziamenti",
  default_active: false,
  questions: [
    {
      question_number: "27.1",
      question_id: "presenza_finanziamenti_coint",
      question_text: "Ad oggi {{placeholder1}} finanziamenti aperti",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "ha", "label": "ha", "leads_to": "tipo_finanziamento_coint"},
            {"id": "non_ha", "label": "non ha", "leads_to": "next_block"}
          ]
        }
      }
    },
    {
      question_number: "27.2",
      question_id: "tipo_finanziamento_coint",
      question_text: "Ha un finanziamento per {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "mutuo", "label": "un altro mutuo", "leads_to": "oggetto_finanziamento_coint"},
            {"id": "prestito_personale", "label": "un prestito personale", "leads_to": "oggetto_finanziamento_coint"}
          ]
        }
      }
    },
    {
      question_number: "27.3",
      question_id: "oggetto_finanziamento_coint",
      question_text: "Per questo finanziamento ha dei pagamenti {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "macchina", "label": "la macchina", "leads_to": "importo_finanziamento_coint"},
            {"id": "leasing", "label": "un leasing", "leads_to": "importo_finanziamento_coint"},
            {"id": "altro", "label": "altro", "leads_to": "oggetto_finanziamento_altro_coint"}
          ]
        }
      }
    },
    {
      question_number: "27.3.1",
      question_id: "oggetto_finanziamento_altro_coint",
      question_text: "Specifica la destinazione del finanziamento",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "text",
          placeholder_label: "Descrizione",
          leads_to: "importo_finanziamento_coint"
        }
      }
    },
    {
      question_number: "27.4",
      question_id: "importo_finanziamento_coint",
      question_text: "di {{placeholder1}} euro",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_rata_coint"
        }
      }
    },
    {
      question_number: "27.5",
      question_id: "frequenza_rata_coint",
      question_text: "{{placeholder1}}",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "mensili", "label": "mensili", "leads_to": "data_fine_finanziamento_coint"},
            {"id": "ogni_2_mesi", "label": "ogni 2 mesi", "leads_to": "data_fine_finanziamento_coint"},
            {"id": "ogni_3_mesi", "label": "ogni 3 mesi", "leads_to": "data_fine_finanziamento_coint"},
            {"id": "ogni_6_mesi", "label": "ogni 6 mesi", "leads_to": "data_fine_finanziamento_coint"},
            {"id": "annuali", "label": "annuali", "leads_to": "data_fine_finanziamento_coint"}
          ]
        }
      }
    },
    {
      question_number: "27.6",
      question_id: "data_fine_finanziamento_coint",
      question_text: "che finiranno a {{placeholder1}} / {{placeholder2}}",
      inline: true,
      placeholders: {
        placeholder1: {
          type: "input",
          input_type": "text",
          placeholder_label: "Mese",
          leads_to: "storico_pagamento_coint"
        },
        placeholder2: {
          type: "input",
          input_type": "number",
          placeholder_label": "Anno",
          leads_to: "storico_pagamento_coint"
        }
      }
    },
    {
      question_number: "27.7",
      question_id: "storico_pagamento_coint",
      question_text: "Per questo finanziamento ha pagato {{placeholder1}} regolarmente",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            {"id": "sempre", "label": "sempre", "leads_to": "tipo_finanziamento_coint"},
            {"id": "quasi_sempre", "label": "quasi sempre", "leads_to": "tipo_finanziamento_coint"},
            {"id": "poco", "label": "poco", "leads_to": "tipo_finanziamento_coint"}
          ]
        }
      }
    }
  ]
};

// Stop Flow Block - 99
export const blockStop: Block = {
  block_number: "99",
  block_id: "stop_flow",
  title: "Interruzione percorso / Surroga",
  default_active: false,
  questions: [
    {
      question_number: "99.1",
      question_id: "stop_flow_entry",
      question_text: "Al momento la funzionalità di surroga non è disponibile. {{placeholder1}}",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "torna_inizio", label: "Torna all'inizio", leads_to: "fase_mutuo" }
          ]
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
  block8,
  block9,
  block10,
  block22,
  block23,
  block24,
  block25,
  block26,
  block27,
  blockStop
];
