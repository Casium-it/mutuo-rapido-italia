
import { supabase } from "@/integrations/supabase/client";
import { sendAdminNotifications } from "./adminNotificationService";
import { retryWithBackoff, RetryOptions } from "@/utils/retryUtils";

type ContactSubmissionResult = {
  success: boolean;
  error?: string;
  expired?: boolean;
  attempts?: number;
  totalTime?: number;
};

/**
 * Aggiorna una submission esistente con i dati di contatto WhatsApp
 * Implementa retry automatico con exponential backoff per gestire errori temporanei
 */
export async function updateSubmissionWithContact(
  submissionId: string,
  firstName: string,
  phoneNumber: string,
  consulting: boolean,
  onProgress?: (attempt: number, maxAttempts: number, error: any) => void
): Promise<ContactSubmissionResult> {
  console.log("=== Starting updateSubmissionWithContact ===");
  console.log("Submission ID:", submissionId);
  console.log("First name:", firstName);
  console.log("Phone number:", phoneNumber);
  console.log("Consulting:", consulting);

  // Retry configuration
  const retryOptions: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 4000,  // 4 seconds max
    backoffFactor: 2, // 1s, 2s, 4s
    onProgress: (attempt, maxAttempts, error) => {
      console.log(`[ContactSubmission] Retry attempt ${attempt}/${maxAttempts}:`, error?.message);
      if (onProgress) {
        onProgress(attempt, maxAttempts, error);
      }
    },
    onRetry: (attempt, error) => {
      console.log(`[ContactSubmission] Retrying after attempt ${attempt} due to:`, error?.message);
    }
  };

  // The main operation to retry
  const submitContactOperation = async (): Promise<ContactSubmissionResult> => {
    try {
      console.log("[ContactSubmission] Checking if submission exists and is valid...");
      
      // First, check if the submission exists and hasn't expired
      const { data: existingSubmission, error: checkError } = await supabase
        .from('form_submissions')
        .select('id, expires_at')
        .eq('id', submissionId)
        .single();

      if (checkError) {
        console.error("[ContactSubmission] Error checking submission:", checkError);
        if (checkError.code === 'PGRST116') {
          return { 
            success: false, 
            expired: true,
            error: "La sessione è scaduta. Ricompila il form per continuare." 
          };
        }
        throw checkError;
      }

      // Check if submission has expired
      const now = new Date();
      const expiresAt = new Date(existingSubmission.expires_at);
      
      if (now > expiresAt) {
        console.log("[ContactSubmission] Submission expired:", { now, expiresAt });
        return { 
          success: false, 
          expired: true,
          error: "La sessione è scaduta. Ricompila il form per continuare." 
        };
      }
      
      // Formatta il numero di telefono rimuovendo spazi e assicurandosi che abbia il prefisso +39
      let formattedPhone = phoneNumber.replace(/\s/g, ""); // Rimuovi tutti gli spazi
      
      // Assicurati che inizi con +39
      if (!formattedPhone.startsWith("+39")) {
        formattedPhone = "+39" + formattedPhone;
      }
      
      console.log("[ContactSubmission] Formatted phone number:", formattedPhone);
      
      // Aggiorna la submission esistente
      console.log("[ContactSubmission] Updating submission with contact details...");
      const { error } = await supabase
        .from('form_submissions')
        .update({
          first_name: firstName,
          phone_number: formattedPhone,
          consulting: consulting
        })
        .eq('id', submissionId);

      if (error) {
        console.error("[ContactSubmission] Error updating submission:", error);
        if (error.code === 'PGRST116') {
          return { 
            success: false, 
            expired: true,
            error: "La sessione è scaduta. Ricompila il form per continuare." 
          };
        }
        throw error;
      }

      console.log("[ContactSubmission] Submission updated successfully");

      // Send admin notifications (non-blocking)
      console.log("[ContactSubmission] Triggering admin notifications...");
      sendAdminNotifications(submissionId).then((result) => {
        if (result.success) {
          console.log(`[ContactSubmission] Admin notifications completed: ${result.notificationsSent} sent`);
        } else {
          console.error("[ContactSubmission] Admin notifications failed:", result.error);
        }
      }).catch((error) => {
        console.error("[ContactSubmission] Error in admin notifications:", error);
      });

      return { success: true };

    } catch (error) {
      console.error("[ContactSubmission] Operation failed:", error);
      throw error; // Re-throw to be handled by retry logic
    }
  };

  // Execute with retry logic
  console.log("[ContactSubmission] Starting operation with retry logic...");
  const result = await retryWithBackoff(submitContactOperation, retryOptions);

  if (result.success) {
    console.log(`[ContactSubmission] ✅ Success after ${result.attempts} attempts in ${result.totalTime}ms`);
    return {
      success: true,
      attempts: result.attempts,
      totalTime: result.totalTime
    };
  } else {
    console.error(`[ContactSubmission] ❌ Failed after ${result.attempts} attempts in ${result.totalTime}ms:`, result.error);
    
    // Check if it's an expired submission error from our operation
    if (result.error?.expired || result.error?.error?.includes?.('scaduta')) {
      return {
        success: false,
        expired: true,
        error: result.error?.error || "La sessione è scaduta. Ricompila il form per continuare.",
        attempts: result.attempts,
        totalTime: result.totalTime
      };
    }
    
    return {
      success: false,
      error: result.error?.message || "Errore imprevisto durante l'aggiornamento",
      attempts: result.attempts,
      totalTime: result.totalTime
    };
  }
}
