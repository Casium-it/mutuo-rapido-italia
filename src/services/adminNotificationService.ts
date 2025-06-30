
import { supabase } from "@/integrations/supabase/client";

type AdminNotificationData = {
  submitterName: string;
  submitterAge: string;
  submitterProvince: string;
  consulting: string;
  submitterPhone: string;
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
  contactData: {
    firstName: string;
    phoneNumber: string;
    consulting: boolean;
  }
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

    // 4. Prepara i dati per la notifica
    const notificationData: AdminNotificationData = {
      submitterName: contactData.firstName,
      submitterAge: age,
      submitterProvince: province,
      consulting: contactData.consulting ? 'Si' : 'No',
      submitterPhone: contactData.phoneNumber
    };

    console.log("Dati notifica admin:", notificationData);

    // 5. Invia notifiche a tutti gli admin abilitati
    const notificationPromises = adminSettings.map(admin => 
      sendSingleAdminNotification(admin.phone_number, admin.admin_name, notificationData)
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
 * Invia una singola notifica admin tramite AiSensy
 */
async function sendSingleAdminNotification(
  phoneNumber: string, 
  adminName: string, 
  data: AdminNotificationData
): Promise<void> {
  try {
    const response = await fetch('/api/send-aisensy-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        campaignName: 'avvisoadmin1',
        parameters: {
          parameter1: data.submitterName,
          parameter2: data.submitterAge,
          parameter3: data.submitterProvince,
          parameter4: data.consulting,
          parameter5: data.submitterPhone
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Errore HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`Notifica admin inviata a ${adminName}:`, result);

  } catch (error) {
    console.error(`Errore invio notifica a ${adminName} (${phoneNumber}):`, error);
    throw error;
  }
}
