
import { supabase } from "@/integrations/supabase/client";

type ContactSubmissionResult = {
  success: boolean;
  error?: string;
  expired?: boolean;
  operations?: {
    sessionValidation: boolean;
    phoneFormatting: boolean;
    databaseUpdate: boolean;
    whatsappMessage: boolean;
    adminNotifications: boolean;
  };
  timing?: {
    total: number;
    sessionCheck: number;
    dbUpdate: number;
    whatsapp: number;
    adminNotifications: number;
  };
};

/**
 * Aggiorna una submission esistente con i dati di contatto WhatsApp
 * Utilizza la nuova Edge Function per gestire tutta la logica in modo sicuro
 */
export async function updateSubmissionWithContact(
  submissionId: string,
  firstName: string,
  phoneNumber: string,
  consulting: boolean
): Promise<ContactSubmissionResult> {
  console.log("=== Starting Contact Submission via Edge Function ===");
  console.log("Submission ID:", submissionId);
  console.log("First name:", firstName);
  console.log("Phone number:", phoneNumber);
  console.log("Consulting:", consulting);

  try {
    const { data, error } = await supabase.functions.invoke('update-contact-submission', {
      body: {
        submissionId,
        firstName: firstName.trim(),
        phoneNumber,
        consulting
      }
    });

    if (error) {
      console.error("Edge Function error:", error);
      throw error;
    }

    if (!data.success) {
      console.error("Contact submission failed:", data.error);
      return {
        success: false,
        error: data.error,
        expired: data.expired,
        operations: data.operations,
        timing: data.timing
      };
    }

    console.log("✅ Contact submission completed successfully");
    console.log("Operations:", data.operations);
    console.log("Timing:", data.timing);

    return {
      success: true,
      operations: data.operations,
      timing: data.timing
    };

  } catch (error) {
    console.error("Contact submission error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore imprevisto durante l'aggiornamento"
    };
  }
}
