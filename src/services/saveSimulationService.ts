
import { supabase } from "@/integrations/supabase/client";
import { FormState } from "@/types/form";

export interface SaveSimulationData {
  name: string;
  phone: string;
  email: string;
  percentage: number;
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
  formSlug: string,
  saveMethod: 'manual-save' | 'completed-save' = 'manual-save'
): Promise<SaveSimulationResult> {
  try {
    console.log(`📝 SAVE-SIMULATION: Starting with method: ${saveMethod}`);
    
    // Convert Sets to Arrays for JSON serialization
    const serializedFormState = {
      ...formState,
      answeredQuestions: Array.from(formState.answeredQuestions || [])
    };

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    console.log(`📝 SAVE-SIMULATION: Calling save-simulation edge function with explicit method: ${saveMethod}`);

    const { data, error } = await supabase.functions.invoke('save-simulation', {
      body: {
        formState: serializedFormState,
        formSlug,
        contactData,
        simulationId: formState.simulationId,
        convertFromAutoSave: true, // Try to convert existing auto-save
        saveMethod // Explicit save method parameter
      }
    });

    if (error) {
      console.error('❌ SAVE-SIMULATION: Edge function error:', error);
      return { success: false, error: error.message };
    }

    if (!data || !data.success) {
      console.error('❌ SAVE-SIMULATION: Failed:', data?.error || 'Unknown error');
      return { success: false, error: data?.error || 'Errore durante il salvataggio' };
    }

    console.log(`✅ SAVE-SIMULATION: Success with resume code: ${data.resumeCode}`);
    return { 
      success: true, 
      resumeCode: data.resumeCode 
    };

  } catch (error) {
    console.error('❌ SAVE-SIMULATION: Unexpected error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
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
    formSlug: string;
    contactInfo: SaveSimulationData;
    linkedFormId?: string; // New field for linked form tracking
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

    console.log("Simulazione caricata con successo");
    return {
      success: true,
      data: {
        formState,
        formSlug: data.form_slug,
        contactInfo: {
          name: data.name,
          phone: data.phone,
          email: data.email,
          percentage: data.percentage || 0
        },
        linkedFormId: data.linked_form_id // Include linked form ID if present
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
