
import { supabase } from "@/integrations/supabase/client";
import { FormResponse, FormState } from "@/types/form";
import { submittedFormStateService } from "./submittedFormStateService";

type SubmissionResult = {
  success: boolean;
  submissionId?: string;
  error?: string;
};

/**
 * Invia i dati del form completato tramite Edge Function sicura
 * @param state - Lo stato attuale del form
 * @param blocks - I blocchi del form per ottenere i testi delle domande
 * @param formSlug - Slug del form per identificare il tipo corretto
 * @returns Risultato dell'operazione con l'ID della submission
 */
export async function submitFormToSupabase(
  state: FormState,
  blocks: any[],
  formSlug: string
): Promise<SubmissionResult> {
  try {
    console.log("🚀 Starting secure form submission via Edge Function...");
    
    // Get referral parameter from URL if present
    const searchParams = new URLSearchParams(window.location.search);
    const referralId = searchParams.get('ref');
    
    // Call the secure Edge Function
    const { data, error } = await supabase.functions.invoke('submit-form', {
      body: {
        formState: state,
        blocks: blocks,
        formSlug: formSlug,
        referralId: referralId
      }
    });

    if (error) {
      console.error("❌ Edge Function error:", error);
      throw new Error(error.message || "Failed to submit form");
    }

    if (!data.success) {
      console.error("❌ Form submission failed:", data.error);
      throw new Error(data.error || "Form submission was not successful");
    }

    console.log("✅ Form submitted successfully via Edge Function");
    console.log("📋 Submission details:", {
      submissionId: data.submissionId,
      processingTime: data.processingTime
    });

    // Save submitted form state connected to submission ID
    submittedFormStateService.saveSubmittedFormState(
      data.submissionId,
      state,
      formSlug
    );

    // Reset current form state after successful submission
    submittedFormStateService.resetCurrentFormState(formSlug);

    return { 
      success: true, 
      submissionId: data.submissionId 
    };
    
  } catch (error) {
    console.error("💥 Error during secure form submission:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Errore imprevisto durante il salvataggio" 
    };
  }
}
