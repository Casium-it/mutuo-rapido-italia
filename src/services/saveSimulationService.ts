
import { supabase } from "@/integrations/supabase/client";
import { FormState } from "@/types/form";
import { getFormInfoBySlug, getFormSlugByType } from "./formMappingService";

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
 * @param formSlug - Slug del form per identificare il tipo corretto
 * @returns Risultato dell'operazione con il codice di ripresa
 */
export async function saveSimulation(
  formState: FormState,
  contactData: SaveSimulationData,
  formSlug: string
): Promise<SaveSimulationResult> {
  try {
    console.log("Inizio salvataggio simulazione...");
    console.log("Form slug:", formSlug);
    console.log("Contact data:", contactData);
    
    // Ottieni le informazioni del form dal database usando il formSlug
    const formInfo = await getFormInfoBySlug(formSlug);
    if (!formInfo) {
      console.error(`SaveSimulation: Form configuration not found for slug: ${formSlug}`);
      return { 
        success: false, 
        error: `Form configuration not found for slug: ${formSlug}` 
      };
    }
    
    console.log(`SaveSimulation: Found form info for ${formSlug}:`, formInfo);
    const formType = formInfo.form_type;
    console.log("SaveSimulation: Form type from DB:", formType);
    
    // Prepara lo stato del form per il salvataggio
    const formStateToSave = {
      ...formState,
      // Converte Set in Array per la serializzazione JSON
      answeredQuestions: Array.from(formState.answeredQuestions || [])
    };
    
    console.log("Form state prepared for saving:", formStateToSave);
    
    // Calcola la data di scadenza (30 giorni da ora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    console.log("Expires at:", expiresAt.toISOString());
    
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

    console.log("Supabase response - data:", data);
    console.log("Supabase response - error:", error);

    if (error) {
      console.error("Errore nel salvataggio della simulazione:", error);
      return { 
        success: false, 
        error: `Errore durante il salvataggio: ${error.message}` 
      };
    }

    if (!data?.resume_code) {
      console.error("Codice di ripresa non generato");
      return { 
        success: false, 
        error: "Codice di ripresa non generato dal database" 
      };
    }

    console.log(`SaveSimulation: Successfully saved with resume code: ${data.resume_code}`);
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
 * Recupera una simulazione salvata usando il codice di ripresa con accesso sicuro
 * @param resumeCode - Codice di ripresa della simulazione
 * @returns I dati della simulazione salvata o null se non trovata
 */
export async function loadSimulation(resumeCode: string): Promise<{
  success: boolean;
  data?: {
    formState: FormState;
    formType: string;
    formSlug: string;
    contactInfo: SaveSimulationData;
  };
  error?: string;
}> {
  try {
    console.log("Caricamento simulazione con codice:", resumeCode);
    
    // Validate resume code format on client side first
    if (!resumeCode || !/^[A-Z0-9]{8}$/.test(resumeCode.toUpperCase())) {
      console.error("Formato del codice di ripresa non valido:", resumeCode);
      return {
        success: false,
        error: "Formato del codice di ripresa non valido. Deve essere di 8 caratteri alfanumerici."
      };
    }
    
    console.log("Query sicura alla tabella saved_simulations con codice:", resumeCode.toUpperCase());
    
    // Use secure query that RLS policies will evaluate
    const { data, error } = await supabase
      .from('saved_simulations')
      .select('*')
      .eq('resume_code', resumeCode.toUpperCase())
      .gt('expires_at', new Date().toISOString())
      .single();

    console.log("Supabase secure query response - data:", data);
    console.log("Supabase secure query response - error:", error);

    if (error) {
      if (error.code === 'PGRST116') {
        console.error("Simulazione non trovata o scaduta");
        return {
          success: false,
          error: "Simulazione non trovata, scaduta o accesso non autorizzato"
        };
      }
      
      // Handle potential RLS policy violations
      if (error.message.includes('row-level security') || error.message.includes('policy')) {
        console.error("Accesso negato dalle politiche di sicurezza:", error);
        return {
          success: false,
          error: "Accesso negato. Assicurati di utilizzare il codice corretto."
        };
      }
      
      console.error("Errore nel caricamento della simulazione:", error);
      return {
        success: false,
        error: `Errore durante il caricamento: ${error.message}`
      };
    }

    if (!data) {
      console.error("Nessun dato restituito dalla query");
      return {
        success: false,
        error: "Simulazione non trovata o scaduta"
      };
    }

    console.log("Dati simulazione trovati:", data);
    
    // Type assertion per il form_state che sappiamo essere compatibile con FormState
    const savedFormState = data.form_state as any;
    
    // Riconverte Array in Set per answeredQuestions
    const formState: FormState = {
      ...savedFormState,
      answeredQuestions: new Set(savedFormState.answeredQuestions || [])
    };

    // Get form slug from form_type
    const formSlug = await getFormSlugByType(data.form_type);
    if (!formSlug) {
      console.error("Form slug non trovato per form_type:", data.form_type);
      return {
        success: false,
        error: "Configurazione form non valida"
      };
    }

    console.log("Simulazione caricata con successo");
    return {
      success: true,
      data: {
        formState,
        formType: data.form_type,
        formSlug: formSlug,
        contactInfo: {
          name: data.name,
          phone: data.phone,
          email: data.email
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
