
import { supabase } from "@/integrations/supabase/client";

type ContactSubmissionResult = {
  success: boolean;
  error?: string;
};

/**
 * Aggiorna una submission esistente con i dati di contatto WhatsApp
 * @param submissionId - ID della submission da aggiornare
 * @param phoneNumber - Numero di telefono (verrà formattato come +390000000000)
 * @param consulting - Se l'utente ha richiesto la consulenza
 * @returns Risultato dell'operazione
 */
export async function updateSubmissionWithContact(
  submissionId: string,
  phoneNumber: string,
  consulting: boolean
): Promise<ContactSubmissionResult> {
  try {
    console.log("Aggiornamento submission con dati contatto...", { submissionId, phoneNumber, consulting });
    
    // Formatta il numero di telefono rimuovendo spazi e assicurandosi che abbia il prefisso +39
    let formattedPhone = phoneNumber.replace(/\s/g, ""); // Rimuovi tutti gli spazi
    
    // Assicurati che inizi con +39
    if (!formattedPhone.startsWith("+39")) {
      formattedPhone = "+39" + formattedPhone;
    }
    
    console.log("Numero formattato:", formattedPhone);
    
    // Aggiorna la submission esistente
    const { error } = await supabase
      .from('form_submissions')
      .update({
        phone_number: formattedPhone,
        consulting: consulting
      })
      .eq('id', submissionId);

    if (error) {
      console.error("Errore nell'aggiornamento della submission:", error);
      throw error;
    }

    console.log("Submission aggiornata con successo");
    return { success: true };
    
  } catch (error) {
    console.error("Errore durante l'aggiornamento della submission:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Errore imprevisto durante l'aggiornamento" 
    };
  }
}
