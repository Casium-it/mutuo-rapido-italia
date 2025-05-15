
import { Block } from "@/types/form";

// Block 6 - Reddito secondario con gestione multipla
export const block6: Block = {
  block_number: "6",
  block_id: "reddito_secondario",
  title: "Reddito secondario",
  priority: 60, // Priorità aggiunta
  default_active: true,
  questions: [
    // Domanda iniziale invariata - Hai reddito secondario?
    {
      question_number: "6.1",
      question_id: "presenza_reddito_secondario",
      question_text: "Negli ultimi anni {{placeholder1}} reddito aggiuntivo oltre al principale dichiarato",
      question_notes: "Puoi aggiungere più fonti di reddito secondario se ne hai.",
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "ricevo", label: "ricevo", leads_to: "fonti_reddito_secondario" },
            { id: "non_ricevo", label: "non ricevo", leads_to: "next_block" }
          ]
        }
      }
    },
    
    // NUOVA DOMANDA: Gestore delle fonti di reddito
    {
      question_number: "6.2",
      question_id: "fonti_reddito_secondario",
      question_text: "Le mie fonti di reddito aggiuntive",
      question_notes: "Qui puoi gestire tutte le tue fonti di reddito aggiuntive. Seleziona una fonte esistente per modificarla o aggiungi una nuova fonte.",
      is_income_manager: true, // Flagga questa domanda come gestore di reddito
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "add_new", label: "Aggiungi una nuova fonte di reddito", leads_to: "nuovo_reddito_secondario" }
          ]
        }
      }
    },
    
    // NUOVA DOMANDA: Selezione del tipo di reddito
    {
      question_number: "6.3",
      question_id: "nuovo_reddito_secondario",
      question_text: "Ricevo reddito aggiuntivo da {{placeholder1}}",
      question_notes: "Seleziona il tipo di reddito che vuoi aggiungere.",
      is_new_income_source: true, // Flagga questa come selezione nuovo reddito
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "affitti", label: "affitti", leads_to: "dettagli_affitti" },
            { id: "lavoro_autonomo", label: "lavoro autonomo", leads_to: "dettagli_lavoro_autonomo" },
            { id: "assegno_minori", label: "assegno minori", leads_to: "dettagli_assegno_minori" },
            { id: "supporto_familiari", label: "supporto familiari", leads_to: "dettagli_supporto_familiari" },
            { id: "dividendi_diritti", label: "dividendi e diritti", leads_to: "dettagli_dividendi_diritti" },
            { id: "altro", label: "altro", leads_to: "dettagli_altro" }
          ]
        }
      }
    },
    
    // DETTAGLI PER AFFITTI
    {
      question_number: "6.4.1",
      question_id: "dettagli_affitti",
      question_text: "Negli ultimi 3 anni di media ho ricevuto {{placeholder1}} euro",
      income_source_type: "affitti", // Tipo di reddito associato
      income_source_details: true, // Flag per indicare che è una domanda di dettaglio reddito
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_affitti",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "6.4.2",
      question_id: "frequenza_affitti",
      question_text: "{{placeholder1}}",
      inline: true,
      income_source_type: "affitti",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensile", label: "mensilmente", leads_to: "stabilita_affitti" },
            { id: "annuale", label: "annualmente", leads_to: "stabilita_affitti" }
          ]
        }
      }
    },
    {
      question_number: "6.4.3",
      question_id: "stabilita_affitti",
      question_text: "Ritengo questa entrata {{placeholder1}}",
      income_source_type: "affitti",
      income_source_details: true,
      is_last_income_detail: true, // Flag per indicare che è l'ultima domanda di dettaglio
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "molto_stabile", label: "molto stabile", leads_to: "fonti_reddito_secondario" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "fonti_reddito_secondario" },
            { id: "poco_stabile", label: "poco stabile", leads_to: "fonti_reddito_secondario" },
            { id: "volatile", label: "volatile", leads_to: "fonti_reddito_secondario" }
          ]
        }
      }
    },
    
    // DETTAGLI PER LAVORO AUTONOMO
    {
      question_number: "6.5.1",
      question_id: "dettagli_lavoro_autonomo",
      question_text: "Negli ultimi 3 anni di media ho ricevuto {{placeholder1}} euro",
      income_source_type: "lavoro_autonomo",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_lavoro_autonomo",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "6.5.2",
      question_id: "frequenza_lavoro_autonomo",
      question_text: "{{placeholder1}}",
      inline: true,
      income_source_type: "lavoro_autonomo",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensile", label: "mensilmente", leads_to: "stabilita_lavoro_autonomo" },
            { id: "annuale", label: "annualmente", leads_to: "stabilita_lavoro_autonomo" }
          ]
        }
      }
    },
    {
      question_number: "6.5.3",
      question_id: "stabilita_lavoro_autonomo",
      question_text: "Ritengo questa entrata {{placeholder1}}",
      income_source_type: "lavoro_autonomo",
      income_source_details: true,
      is_last_income_detail: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "molto_stabile", label: "molto stabile", leads_to: "fonti_reddito_secondario" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "fonti_reddito_secondario" },
            { id: "poco_stabile", label: "poco stabile", leads_to: "fonti_reddito_secondario" },
            { id: "volatile", label: "volatile", leads_to: "fonti_reddito_secondario" }
          ]
        }
      }
    },
    
    // DETTAGLI PER ASSEGNO MINORI (schema simile agli altri)
    {
      question_number: "6.6.1",
      question_id: "dettagli_assegno_minori",
      question_text: "Negli ultimi 3 anni di media ho ricevuto {{placeholder1}} euro",
      income_source_type: "assegno_minori",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_assegno_minori",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "6.6.2",
      question_id: "frequenza_assegno_minori",
      question_text: "{{placeholder1}}",
      inline: true,
      income_source_type: "assegno_minori",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensile", label: "mensilmente", leads_to: "stabilita_assegno_minori" },
            { id: "annuale", label: "annualmente", leads_to: "stabilita_assegno_minori" }
          ]
        }
      }
    },
    {
      question_number: "6.6.3",
      question_id: "stabilita_assegno_minori",
      question_text: "Ritengo questa entrata {{placeholder1}}",
      income_source_type: "assegno_minori",
      income_source_details: true,
      is_last_income_detail: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "molto_stabile", label: "molto stabile", leads_to: "fonti_reddito_secondario" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "fonti_reddito_secondario" },
            { id: "poco_stabile", label: "poco stabile", leads_to: "fonti_reddito_secondario" },
            { id: "volatile", label: "volatile", leads_to: "fonti_reddito_secondario" }
          ]
        }
      }
    },
    
    // DETTAGLI PER ALTRI TIPI DI REDDITO (supporto_familiari, dividendi_diritti, altro)
    // Implementiamo gli stessi campi per ciascun tipo seguendo lo schema precedente
    
    // SUPPORTO FAMILIARI
    {
      question_number: "6.7.1",
      question_id: "dettagli_supporto_familiari",
      question_text: "Negli ultimi 3 anni di media ho ricevuto {{placeholder1}} euro",
      income_source_type: "supporto_familiari",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_supporto_familiari",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "6.7.2",
      question_id: "frequenza_supporto_familiari",
      question_text: "{{placeholder1}}",
      inline: true,
      income_source_type: "supporto_familiari",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensile", label: "mensilmente", leads_to: "stabilita_supporto_familiari" },
            { id: "annuale", label: "annualmente", leads_to: "stabilita_supporto_familiari" }
          ]
        }
      }
    },
    {
      question_number: "6.7.3",
      question_id: "stabilita_supporto_familiari",
      question_text: "Ritengo questa entrata {{placeholder1}}",
      income_source_type: "supporto_familiari",
      income_source_details: true,
      is_last_income_detail: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "molto_stabile", label: "molto stabile", leads_to: "fonti_reddito_secondario" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "fonti_reddito_secondario" },
            { id: "poco_stabile", label: "poco stabile", leads_to: "fonti_reddito_secondario" },
            { id: "volatile", label: "volatile", leads_to: "fonti_reddito_secondario" }
          ]
        }
      }
    },
    
    // DIVIDENDI E DIRITTI
    {
      question_number: "6.8.1",
      question_id: "dettagli_dividendi_diritti",
      question_text: "Negli ultimi 3 anni di media ho ricevuto {{placeholder1}} euro",
      income_source_type: "dividendi_diritti",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_dividendi_diritti",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "6.8.2",
      question_id: "frequenza_dividendi_diritti",
      question_text: "{{placeholder1}}",
      inline: true,
      income_source_type: "dividendi_diritti",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensile", label: "mensilmente", leads_to: "stabilita_dividendi_diritti" },
            { id: "annuale", label: "annualmente", leads_to: "stabilita_dividendi_diritti" }
          ]
        }
      }
    },
    {
      question_number: "6.8.3",
      question_id: "stabilita_dividendi_diritti",
      question_text: "Ritengo questa entrata {{placeholder1}}",
      income_source_type: "dividendi_diritti",
      income_source_details: true,
      is_last_income_detail: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "molto_stabile", label: "molto stabile", leads_to: "fonti_reddito_secondario" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "fonti_reddito_secondario" },
            { id: "poco_stabile", label: "poco stabile", leads_to: "fonti_reddito_secondario" },
            { id: "volatile", label: "volatile", leads_to: "fonti_reddito_secondario" }
          ]
        }
      }
    },
    
    // ALTRO REDDITO
    {
      question_number: "6.9.1",
      question_id: "dettagli_altro",
      question_text: "Specifica la fonte del reddito aggiuntivo: {{placeholder1}}",
      income_source_type: "altro",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "text",
          placeholder_label: "Descrizione",
          leads_to: "importo_altro",
          input_validation: "free_text"
        }
      }
    },
    {
      question_number: "6.9.2",
      question_id: "importo_altro",
      question_text: "Negli ultimi 3 anni di media ho ricevuto {{placeholder1}} euro",
      income_source_type: "altro",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "input",
          input_type: "number",
          placeholder_label: "Importo",
          leads_to: "frequenza_altro",
          input_validation: "euro"
        }
      }
    },
    {
      question_number: "6.9.3",
      question_id: "frequenza_altro",
      question_text: "{{placeholder1}}",
      inline: true,
      income_source_type: "altro",
      income_source_details: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "mensile", label: "mensilmente", leads_to: "stabilita_altro" },
            { id: "annuale", label: "annualmente", leads_to: "stabilita_altro" }
          ]
        }
      }
    },
    {
      question_number: "6.9.4",
      question_id: "stabilita_altro",
      question_text: "Ritengo questa entrata {{placeholder1}}",
      income_source_type: "altro",
      income_source_details: true,
      is_last_income_detail: true,
      leads_to_placeholder_priority: "placeholder1",
      placeholders: {
        placeholder1: {
          type: "select",
          options: [
            { id: "molto_stabile", label: "molto stabile", leads_to: "fonti_reddito_secondario" },
            { id: "abbastanza_stabile", label: "abbastanza stabile", leads_to: "fonti_reddito_secondario" },
            { id: "poco_stabile", label: "poco stabile", leads_to: "fonti_reddito_secondario" },
            { id: "volatile", label: "volatile", leads_to: "fonti_reddito_secondario" }
          ]
        }
      }
    }
  ]
};
