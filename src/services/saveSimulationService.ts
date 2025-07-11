
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
 * Save a simulation using the secure edge function
 * @param formState - The current form state
 * @param contactData - User contact information
 * @param formSlug - The form identifier
 * @param existingResumeCode - Optional existing resume code for updates
 * @returns Result with resume code or error
 */
export async function saveSimulation(
  formState: FormState,
  contactData: SaveSimulationData,
  formSlug: string,
  existingResumeCode?: string
): Promise<SaveSimulationResult> {
  try {
    console.log("💾 Saving simulation with edge function:", {
      formSlug,
      contactName: contactData.name ? "✓" : "✗",
      existingCode: existingResumeCode ? "✓" : "✗"
    });
    
    // Call the secure edge function
    const { data, error } = await supabase.functions.invoke('save-simulation', {
      body: {
        formState,
        contactData,
        formSlug,
        existingResumeCode
      }
    });

    if (error) {
      console.error("❌ Edge function error:", error);
      return {
        success: false,
        error: "Errore durante il salvataggio della simulazione"
      };
    }

    if (!data.success) {
      console.error("❌ Save failed:", data.error);
      return {
        success: false,
        error: data.error
      };
    }

    console.log("✅ Simulation saved successfully with resume code:", data.resumeCode);
    
    return {
      success: true,
      resumeCode: data.resumeCode
    };
    
  } catch (error) {
    console.error("❌ Save simulation error:", error);
    return {
      success: false,
      error: "Errore imprevisto durante il salvataggio della simulazione"
    };
  }
}

/**
 * Get the resume context from session storage
 * Used to detect if user came from a resume operation
 */
export function getResumeContext(): {
  resumeCode?: string;
  contactInfo?: SaveSimulationData;
} {
  try {
    const resumeContext = sessionStorage.getItem('resumeContext');
    if (resumeContext) {
      return JSON.parse(resumeContext);
    }
  } catch (error) {
    console.error("Error getting resume context:", error);
  }
  return {};
}

/**
 * Set the resume context in session storage
 * Called when user successfully resumes a simulation
 */
export function setResumeContext(resumeCode: string, contactInfo: SaveSimulationData) {
  try {
    sessionStorage.setItem('resumeContext', JSON.stringify({
      resumeCode,
      contactInfo
    }));
  } catch (error) {
    console.error("Error setting resume context:", error);
  }
}

/**
 * Clear the resume context
 * Called after successful save or when no longer needed
 */
export function clearResumeContext() {
  try {
    sessionStorage.removeItem('resumeContext');
  } catch (error) {
    console.error("Error clearing resume context:", error);
  }
}
