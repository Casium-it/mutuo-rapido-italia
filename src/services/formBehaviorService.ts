
import { FormState } from "@/types/form";
import { submitFormToSupabase } from "./formSubmissionService";
import { updateSubmissionWithContact } from "./contactSubmissionService";
import { supabase } from "@/integrations/supabase/client";

export interface CompletionResult {
  success: boolean;
  submissionId?: string;
  error?: string;
  shouldRedirect?: boolean;
  redirectUrl?: string;
}

/**
 * Gestisce il completamento del form in base al comportamento configurato
 */
export async function handleFormCompletion(
  formState: FormState,
  blocks: any[],
  completionBehavior: 'form-completed' | 'form-completed-redirect' = 'form-completed',
  linkedToken?: string
): Promise<CompletionResult> {
  try {
    console.log('Form completion started with behavior:', completionBehavior);
    console.log('Linked token:', linkedToken || 'none');

    // 1. Invia il form a Supabase
    const submissionResult = await submitFormToSupabase(formState, blocks, linkedToken);
    
    if (!submissionResult.success) {
      return {
        success: false,
        error: submissionResult.error
      };
    }

    // 2. Per i form linkati, usa sempre form-completed-redirect
    if (linkedToken) {
      return {
        success: true,
        submissionId: submissionResult.submissionId,
        shouldRedirect: true,
        redirectUrl: `/form-completed?id=${submissionResult.submissionId}&linked=true`
      };
    }

    // 3. Gestisci il comportamento normale
    switch (completionBehavior) {
      case 'form-completed-redirect':
        return {
          success: true,
          submissionId: submissionResult.submissionId,
          shouldRedirect: true,
          redirectUrl: `/form-completed-redirect?id=${submissionResult.submissionId}`
        };
      
      case 'form-completed':
      default:
        return {
          success: true,
          submissionId: submissionResult.submissionId,
          shouldRedirect: true,
          redirectUrl: `/form-completed?id=${submissionResult.submissionId}`
        };
    }

  } catch (error) {
    console.error('Form completion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore durante il completamento del form'
    };
  }
}

export async function handleContactSubmission(
  submissionId: string,
  firstName: string,
  phoneNumber: string,
  consulting: boolean,
  onProgress?: (attempt: number, maxAttempts: number, error: any) => void
) {
  return await updateSubmissionWithContact(
    submissionId,
    firstName,
    phoneNumber,
    consulting,
    onProgress
  );
}

// Service for form behavior management
export const formBehaviorService = {
  async getFormBehavior(formSlug: string) {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('completion_behavior')
        .eq('slug', formSlug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching form behavior:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getFormBehavior:', error);
      return null;
    }
  },

  getCompletionRoute(behavior: 'form-completed' | 'form-completed-redirect') {
    switch (behavior) {
      case 'form-completed-redirect':
        return '/form-completed-redirect';
      case 'form-completed':
      default:
        return '/form-completed';
    }
  }
};
