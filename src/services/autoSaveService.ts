import { FormState } from "@/types/form";
import { supabase } from "@/integrations/supabase/client";

export interface AutoSaveData {
  simulationId: string;
  formState: FormState;
  percentage: number;
  formSlug: string;
}

export interface AutoSaveResult {
  success: boolean;
  error?: string;
}

/**
 * Creates or updates an auto-save record for anonymous tracking
 */
export async function createOrUpdateAutoSave(data: AutoSaveData): Promise<AutoSaveResult> {
  try {
    // Call the auto-save edge function
    const { error } = await supabase.functions.invoke('auto-save-simulation', {
      body: {
        simulationId: data.simulationId,
        formState: data.formState,
        percentage: data.percentage,
        formSlug: data.formSlug
      }
    });

    if (error) {
      console.error('Auto-save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Auto-save service error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Converts an auto-save record to a user save by adding contact information
 */
export async function convertAutoSaveToUserSave(
  simulationId: string,
  formState: FormState,
  formSlug: string,
  contactData: { name: string; phone: string; email: string; percentage: number }
): Promise<AutoSaveResult> {
  try {
    // Call the regular save-simulation function to convert auto-save
    const { error } = await supabase.functions.invoke('save-simulation', {
      body: {
        formState,
        formSlug,
        simulationId,
        contactData,
        convertFromAutoSave: true
      }
    });

    if (error) {
      console.error('Convert auto-save error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Convert auto-save service error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}