
import { supabase } from "@/integrations/supabase/client";

type AdminNotificationData = {
  firstName: string;
  phoneNumber: string;
  consulting: boolean;
};

type NotificationResult = {
  success: boolean;
  error?: string;
};

/**
 * Invia notifiche agli admin (Leonardo e Filippo) quando viene completata una submission
 */
export async function sendAdminNotifications(
  submissionId: string,
  contactData: AdminNotificationData
): Promise<NotificationResult> {
  try {
    console.log("Invio notifiche admin per submission:", submissionId);
    
    // 1. Ottieni le impostazioni di notifica degli admin
    const { data: adminSettings, error: settingsError } = await supabase
      .from('admin_notification_settings')
      .select('*')
      .eq('notifications_enabled', true);

    if (settingsError) {
      console.error("Errore nel recupero impostazioni admin:", settingsError);
      throw settingsError;
    }

    if (!adminSettings || adminSettings.length === 0) {
      console.log("Nessun admin ha le notifiche abilitate");
      return { success: true };
    }

    // 2. Ottieni i dati del form per estrarre età e provincia
    const { data: formResponses, error: responsesError } = await supabase
      .from('form_responses')
      .select('question_id, response_value')
      .eq('submission_id', submissionId);

    if (responsesError) {
      console.error("Errore nel recupero risposte form:", responsesError);
      throw responsesError;
    }

    // 3. Estrai età e provincia dalle risposte
    const ageAndCityResponse = formResponses?.find(r => r.question_id === 'eta_e_citta');
    let age = 'N/A';
    let province = 'N/A';

    if (ageAndCityResponse && ageAndCityResponse.response_value) {
      const responseData = ageAndCityResponse.response_value as any;
      age = responseData.placeholder1 || 'N/A';
      province = responseData.placeholder2 || 'N/A';
    }

    // 4. Invia notifiche a tutti gli admin abilitati usando il servizio esistente
    const notificationPromises = adminSettings.map(admin => 
      sendSingleAdminNotification(admin.phone_number, contactData.firstName, age, province, contactData.consulting, contactData.phoneNumber)
    );

    const results = await Promise.allSettled(notificationPromises);
    
    // Log dei risultati
    results.forEach((result, index) => {
      const adminName = adminSettings[index].admin_name;
      if (result.status === 'fulfilled') {
        console.log(`Notifica inviata con successo a ${adminName}`);
      } else {
        console.error(`Errore invio notifica a ${adminName}:`, result.reason);
      }
    });

    return { success: true };

  } catch (error) {
    console.error("Errore nell'invio notifiche admin:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Errore imprevisto" 
    };
  }
}

/**
 * Invia una singola notifica admin usando il servizio AiSensy esistente
 */
async function sendSingleAdminNotification(
  phoneNumber: string, 
  firstName: string,
  age: string,
  province: string,
  consulting: boolean,
  submitterPhone: string
): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('send-aisensy-message', {
      body: {
        phoneNumber: phoneNumber,
        campaignName: 'avvisoadmin1',
        parameters: {
          parameter1: firstName,
          parameter2: age,
          parameter3: province,
          parameter4: consulting ? 'Si' : 'No',
          parameter5: submitterPhone
        }
      }
    });

    if (error) {
      console.error("Errore nell'invocazione della funzione:", error);
      throw error;
    }

    if (!data.success) {
      console.error("Errore dalla funzione AiSensy:", data.error);
      throw new Error(data.error || "Errore sconosciuto dall'API AiSensy");
    }

    console.log("Notifica admin inviata con successo:", data);

  } catch (error) {
    console.error(`Errore invio notifica a ${phoneNumber}:`, error);
    throw error;
  }
}
