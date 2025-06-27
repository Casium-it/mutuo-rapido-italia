
import { supabase } from "@/integrations/supabase/client";

type AisensyMessageResult = {
  success: boolean;
  error?: string;
  message?: string;
};

/**
 * Invia un messaggio WhatsApp tramite AiSensy
 * @param firstName - Nome dell'utente
 * @param phoneNumber - Numero di telefono (formato +390000000000)
 * @returns Risultato dell'operazione
 */
export async function sendAisensyMessage(
  firstName: string,
  phoneNumber: string
): Promise<AisensyMessageResult> {
  try {
    console.log("Invio messaggio AiSensy...", { firstName, phoneNumber });
    
    const { data, error } = await supabase.functions.invoke('send-aisensy-message', {
      body: {
        firstName,
        phoneNumber
      }
    });

    if (error) {
      console.error("Errore nella chiamata alla funzione AiSensy:", error);
      throw error;
    }

    if (!data.success) {
      console.error("Errore dalla funzione AiSensy:", data.error);
      return {
        success: false,
        error: data.error || "Errore sconosciuto da AiSensy"
      };
    }

    console.log("Messaggio AiSensy inviato con successo");
    return {
      success: true,
      message: "Messaggio WhatsApp inviato con successo"
    };
    
  } catch (error) {
    console.error("Errore durante l'invio del messaggio AiSensy:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore imprevisto durante l'invio del messaggio"
    };
  }
}
