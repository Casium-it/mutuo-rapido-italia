
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
    simulationId?: string; // Unique simulation identifier
    contactInfo: ResumeSimulationData;
    linkedFormId?: string; // New field for linked form tracking
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
    
    // Robust handling of answeredQuestions - convert to Set properly
    const answeredQuestions = data.data.formState.answeredQuestions;
    let answeredQuestionsArray = [];
    
    if (answeredQuestions) {
      if (Array.isArray(answeredQuestions)) {
        answeredQuestionsArray = answeredQuestions;
      } else if (typeof answeredQuestions === 'object') {
        // Handle case where it might be stored as an object (old format)
        if (answeredQuestions instanceof Set) {
          answeredQuestionsArray = Array.from(answeredQuestions);
        } else {
          // If it's a plain object, try to extract keys or values
          answeredQuestionsArray = Object.keys(answeredQuestions).length > 0 
            ? Object.keys(answeredQuestions) 
            : Object.values(answeredQuestions).filter(v => typeof v === 'string');
        }
      }
    }

    const formState: FormState = {
      ...data.data.formState,
      answeredQuestions: new Set(answeredQuestionsArray)
    };

    return {
      success: true,
      data: {
        formState,
        formSlug: data.data.formSlug,
        simulationId: data.data.simulationId, // Include simulation ID
        contactInfo: data.data.contactInfo,
        linkedFormId: data.data.linkedFormId // Include linked form ID if present
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
