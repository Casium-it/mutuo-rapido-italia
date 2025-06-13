
import { supabase } from "@/integrations/supabase/client";
import { FormState } from "@/types/form";

export interface SaveSimulationData {
  name: string;
  phone: string;
  email: string;
}

export interface SaveSimulationResult {
  success: boolean;
  resumeCode?: string;
  error?: string;
}

/**
 * Salva lo stato del form nel database con le informazioni di contatto dell'utente
 * @param formState - Lo stato completo del form da salvare
 * @param contactData - Dati di contatto dell'utente
 * @param formType - Tipo di form (es. "pensando", "cercando", etc.)
 * @returns Risultato dell'operazione con il codice di ripresa
 */
export async function saveSimulation(
  formState: FormState,
  contactData: SaveSimulationData,
  formType: string
): Promise<SaveSimulationResult> {
  try {
    console.log("Inizio salvataggio simulazione...");
    
    // Prepara lo stato del form per il salvataggio
    const formStateToSave = {
      ...formState,
      // Converte Set in Array per la serializzazione JSON
      answeredQuestions: Array.from(formState.answeredQuestions || [])
    };
    
    // Calcola la data di scadenza (30 giorni da ora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Inserisci i dati nella tabella saved_simulations
    const { data, error } = await supabase
      .from('saved_simulations')
      .insert({
        name: contactData.name,
        phone: contactData.phone,
        email: contactData.email,
        form_state: formStateToSave,
        form_type: formType,
        expires_at: expiresAt.toISOString()
      })
      .select('resume_code')
      .single();

    if (error) {
      console.error("Errore nel salvataggio della simulazione:", error);
      throw error;
    }

    if (!data?.resume_code) {
      throw new Error("Codice di ripresa non generato");
    }

    console.log("Simulazione salvata con successo, codice:", data.resume_code);
    return { 
      success: true, 
      resumeCode: data.resume_code 
    };
    
  } catch (error) {
    console.error("Errore durante il salvataggio della simulazione:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Errore imprevisto durante il salvataggio" 
    };
  }
}

/**
 * Recupera una simulazione salvata usando il codice di ripresa tramite la funzione sicura
 * @param resumeCode - Codice di ripresa della simulazione
 * @returns I dati della simulazione salvata o null se non trovata
 */
export async function loadSimulation(resumeCode: string): Promise<{
  success: boolean;
  data?: {
    formState: FormState;
    formType: string;
    contactInfo: SaveSimulationData;
  };
  error?: string;
}> {
  try {
    console.log("Caricamento simulazione con codice:", resumeCode);
    
    // Validate resume code format on client side first
    if (!resumeCode || !/^[A-Z0-9]{8}$/.test(resumeCode.toUpperCase())) {
      return {
        success: false,
        error: "Formato del codice di ripresa non valido. Deve essere di 8 caratteri alfanumerici."
      };
    }
    
    // Use the secure database function instead of direct table access
    const { data, error } = await supabase
      .rpc('get_saved_simulation_by_resume_code', {
        p_resume_code: resumeCode.toUpperCase()
      });

    if (error) {
      console.error("Errore nel caricamento della simulazione:", error);
      return {
        success: false,
        error: "Errore durante il caricamento della simulazione"
      };
    }

    // Check if any data was returned
    if (!data || data.length === 0) {
      return {
        success: false,
        error: "Simulazione non trovata, scaduta o troppi tentativi. Riprova tra qualche minuto."
      };
    }

    const simulationData = data[0];
    
    // Type assertion per il form_state che sappiamo essere compatibile con FormState
    const savedFormState = simulationData.form_state as any;
    
    // Riconverte Array in Set per answeredQuestions
    const formState: FormState = {
      ...savedFormState,
      answeredQuestions: new Set(savedFormState.answeredQuestions || [])
    };

    console.log("Simulazione caricata con successo");
    return {
      success: true,
      data: {
        formState,
        formType: simulationData.form_type,
        contactInfo: {
          name: simulationData.name,
          phone: simulationData.phone,
          email: simulationData.email
        }
      }
    };
    
  } catch (error) {
    console.error("Errore durante il caricamento della simulazione:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore imprevisto durante il caricamento"
    };
  }
}
