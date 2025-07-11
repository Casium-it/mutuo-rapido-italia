
import { supabase } from "@/integrations/supabase/client";
import { FormState } from "@/types/form";

export interface ResumeSimulationData {
  name: string;
  phone: string;
  email: string;
}

export interface ResumeSimulationResult {
  success: boolean;
  data?: {
    formState: FormState;
    formSlug: string;
    contactInfo: ResumeSimulationData;
  };
  error?: string;
}

/**
 * Resume a saved simulation using the secure edge function
 * @param resumeCode - The resume code for the simulation
 * @returns Result with simulation data or error
 */
export async function resumeSimulation(resumeCode: string): Promise<ResumeSimulationResult> {
  try {
    console.log("🔄 Resuming simulation with code:", resumeCode);
    
    // Call the secure edge function
    const { data, error } = await supabase.functions.invoke('resume-simulation', {
      body: { resumeCode: resumeCode.trim().toUpperCase() }
    });

    if (error) {
      console.error("❌ Edge function error:", error);
      return {
        success: false,
        error: "Errore durante il caricamento della simulazione"
      };
    }

    if (!data.success) {
      console.error("❌ Resume failed:", data.error);
      return {
        success: false,
        error: data.error
      };
    }

    console.log("✅ Simulation resumed successfully");
    
    // Convert answeredQuestions array back to Set
    const formState: FormState = {
      ...data.data.formState,
      answeredQuestions: new Set(data.data.formState.answeredQuestions || [])
    };

    return {
      success: true,
      data: {
        formState,
        formSlug: data.data.formSlug,
        contactInfo: data.data.contactInfo
      }
    };
    
  } catch (error) {
    console.error("❌ Resume simulation error:", error);
    return {
      success: false,
      error: "Errore imprevisto durante il caricamento della simulazione"
    };
  }
}
