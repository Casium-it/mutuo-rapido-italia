
import { supabase } from "@/integrations/supabase/client";

export interface CreateLinkedSimulationData {
  name: string;
  phone: string;
  email: string;
  formSlug: string;
  linkedFormId: string;
}

export interface CreateLinkedSimulationResult {
  success: boolean;
  resumeCode?: string;
  linkedFormId?: string;
  error?: string;
}

/**
 * Crea una simulazione salvata collegata a un form specifico
 * @param data - Dati per creare la simulazione collegata
 * @returns Risultato dell'operazione con il codice di ripresa
 */
export async function createLinkedSimulation(
  data: CreateLinkedSimulationData
): Promise<CreateLinkedSimulationResult> {
  try {
    console.log("🚀 Creating linked simulation...");
    console.log("Data:", data);
    
    // Call the edge function
    const { data: result, error } = await supabase.functions.invoke('create-saved-simulation-linked', {
      body: data
    });

    if (error) {
      console.error("❌ Edge Function error:", error);
      throw new Error(error.message || "Failed to create linked simulation");
    }

    if (!result.success) {
      console.error("❌ Linked simulation creation failed:", result.error);
      throw new Error(result.error || "Linked simulation creation was not successful");
    }

    console.log("✅ Linked simulation created successfully");
    console.log("📋 Details:", {
      resumeCode: result.resumeCode,
      linkedFormId: result.linkedFormId
    });

    return { 
      success: true, 
      resumeCode: result.resumeCode,
      linkedFormId: result.linkedFormId
    };
    
  } catch (error) {
    console.error("💥 Error during linked simulation creation:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Errore imprevisto durante la creazione" 
    };
  }
}

/**
 * Crea un nuovo form collegato
 * @param data - Dati del form collegato
 * @returns Risultato dell'operazione con l'ID del form
 */
export interface CreateLinkedFormData {
  name: string;
  phoneNumber: string;
  email: string;
  formSlug: string;
  link?: string;
  state?: string;
  percentage?: number;
}

export interface CreateLinkedFormResult {
  success: boolean;
  linkedFormId?: string;
  error?: string;
}

export async function createLinkedForm(
  data: CreateLinkedFormData
): Promise<CreateLinkedFormResult> {
  try {
    console.log("🔄 Creating linked form...");
    
    const { data: result, error } = await supabase
      .from('linked_forms')
      .insert({
        name: data.name,
        phone_number: data.phoneNumber,
        email: data.email,
        form_slug: data.formSlug,
        link: data.link,
        state: data.state || 'active',
        percentage: data.percentage || 0
      })
      .select('id')
      .single();

    if (error) {
      console.error("❌ Error creating linked form:", error);
      return { 
        success: false, 
        error: `Errore durante la creazione: ${error.message}` 
      };
    }

    if (!result?.id) {
      console.error("❌ Linked form ID not generated");
      return { 
        success: false, 
        error: "ID del form collegato non generato" 
      };
    }

    console.log("✅ Linked form created successfully with ID:", result.id);
    return { 
      success: true, 
      linkedFormId: result.id 
    };
    
  } catch (error) {
    console.error("💥 Error during linked form creation:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Errore imprevisto durante la creazione" 
    };
  }
}
