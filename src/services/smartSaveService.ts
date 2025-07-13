import { FormState } from "@/types/form";
import { supabase } from "@/integrations/supabase/client";

export interface SmartSaveData {
  simulationId: string;
  formState: Omit<FormState, 'answeredQuestions'> & { answeredQuestions: string[] };
  percentage: number;
  formSlug: string;
  saveMethod: 'auto-save' | 'manual-save' | 'completed-save';
  contactData?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface SmartSaveResult {
  success: boolean;
  resumeCode?: string;
  error?: string;
}

/**
 * Universal smart save function that handles all save scenarios
 */
export async function smartSave(data: SmartSaveData): Promise<SmartSaveResult> {
  try {
    console.log(`🚀 Smart save - Method: ${data.saveMethod}, Simulation: ${data.simulationId}`);

    const { data: responseData, error } = await supabase.functions.invoke('smart-save-simulation', {
      body: {
        simulationId: data.simulationId,
        formState: data.formState,
        percentage: data.percentage,
        formSlug: data.formSlug,
        saveMethod: data.saveMethod,
        contactData: data.contactData
      }
    });

    if (error) {
      console.error(`❌ Smart save failed (${data.saveMethod}):`, error);
      return { success: false, error: error.message };
    }

    if (!responseData || !responseData.success) {
      console.error(`❌ Smart save failed (${data.saveMethod}):`, responseData?.error || 'Unknown error');
      return { success: false, error: responseData?.error || 'Smart save failed' };
    }

    console.log(`✅ Smart save successful (${data.saveMethod}) for simulation:`, data.simulationId);
    return { 
      success: true, 
      resumeCode: responseData.resumeCode 
    };

  } catch (error) {
    console.error(`❌ Smart save service error (${data.saveMethod}):`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Auto-save function for background saves
 */
export async function autoSave(
  simulationId: string,
  formState: FormState,
  percentage: number,
  formSlug: string
): Promise<SmartSaveResult> {
  return smartSave({
    simulationId,
    formState: {
      ...formState,
      answeredQuestions: Array.from(formState.answeredQuestions)
    },
    percentage,
    formSlug,
    saveMethod: 'auto-save'
  });
}

/**
 * Manual save function for user-initiated saves with contact info
 */
export async function manualSave(
  simulationId: string,
  formState: FormState,
  percentage: number,
  formSlug: string,
  contactData: { name: string; phone: string; email: string }
): Promise<SmartSaveResult> {
  return smartSave({
    simulationId,
    formState: {
      ...formState,
      answeredQuestions: Array.from(formState.answeredQuestions)
    },
    percentage,
    formSlug,
    saveMethod: 'manual-save',
    contactData
  });
}

/**
 * Completed save function for form completion
 */
export async function completedSave(
  simulationId: string,
  formState: FormState,
  formSlug: string
): Promise<SmartSaveResult> {
  return smartSave({
    simulationId,
    formState: {
      ...formState,
      answeredQuestions: Array.from(formState.answeredQuestions)
    },
    percentage: 100,
    formSlug,
    saveMethod: 'completed-save'
  });
}