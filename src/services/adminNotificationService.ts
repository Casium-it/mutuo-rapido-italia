
import { supabase } from "@/integrations/supabase/client";
import { sendCustomAisensyMessage } from "./aisensyService";

type AdminNotificationResult = {
  success: boolean;
  error?: string;
  notificationsSent?: number;
};

/**
 * Send admin notifications for a form submission
 * @param submissionId - ID of the form submission
 * @returns Result of the notification operation
 */
export async function sendAdminNotifications(
  submissionId: string
): Promise<AdminNotificationResult> {
  try {
    console.log("Sending admin notifications for submission:", submissionId);
    
    // 1. Fetch enabled admin notification settings
    const { data: adminSettings, error: adminError } = await supabase
      .from('admin_notification_settings')
      .select('admin_name, phone_number')
      .eq('notifications_enabled', true);

    if (adminError) {
      console.error("Error fetching admin settings:", adminError);
      return { success: false, error: "Failed to fetch admin settings" };
    }

    if (!adminSettings || adminSettings.length === 0) {
      console.log("No enabled admin notifications found");
      return { success: true, notificationsSent: 0 };
    }

    // 2. Fetch submission data
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select('first_name, phone_number, consulting')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      console.error("Error fetching submission:", submissionError);
      return { success: false, error: "Failed to fetch submission data" };
    }

    // 3. Extract age and province from form responses
    const { ageData, provinceData } = await extractAgeAndProvince(submissionId);

    // 4. Prepare message parameters
    const submitterName = submission.first_name || "Nome non disponibile";
    const submitterAge = ageData || "Età non disponibile";
    const submitterProvince = provinceData || "Provincia non disponibile";
    const consultingStatus = submission.consulting ? "Si ✅" : "No ❌";
    const submitterPhone = submission.phone_number || "Telefono non disponibile";

    console.log("Admin notification data:", {
      name: submitterName,
      age: submitterAge,
      province: submitterProvince,
      consulting: consultingStatus,
      phone: submitterPhone
    });

    // 5. Send notifications to all enabled admins
    let successCount = 0;
    const notificationPromises = adminSettings.map(async (admin) => {
      try {
        const result = await sendCustomAisensyMessage({
          campaignName: 'avvisoadmin1',
          destination: admin.phone_number,
          userName: admin.admin_name,
          source: 'admin-notification',
          templateParams: [
            submitterName,
            submitterAge,
            submitterProvince,
            consultingStatus,
            submitterPhone
          ]
        });

        if (result.success) {
          console.log(`Admin notification sent successfully to ${admin.admin_name}`);
          successCount++;
        } else {
          console.error(`Failed to send notification to ${admin.admin_name}:`, result.error);
        }
      } catch (error) {
        console.error(`Error sending notification to ${admin.admin_name}:`, error);
      }
    });

    // Wait for all notifications to complete (non-blocking for user flow)
    await Promise.allSettled(notificationPromises);

    console.log(`Admin notifications completed. Sent: ${successCount}/${adminSettings.length}`);
    return { success: true, notificationsSent: successCount };

  } catch (error) {
    console.error("Error in sendAdminNotifications:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Extract age and province data from form responses
 * @param submissionId - ID of the form submission
 * @returns Object containing age and province data
 */
async function extractAgeAndProvince(submissionId: string): Promise<{
  ageData: string | null;
  provinceData: string | null;
}> {
  try {
    const { data: responses, error } = await supabase
      .from('form_responses')
      .select('response_value')
      .eq('submission_id', submissionId)
      .eq('question_id', 'eta_e_citta');

    if (error || !responses || responses.length === 0) {
      console.log("No eta_e_citta response found for submission:", submissionId);
      return { ageData: null, provinceData: null };
    }

    const response = responses[0];
    const responseValue = response.response_value as any;

    // Extract age from placeholder1 and province from placeholder2
    const ageData = responseValue?.placeholder1 || null;
    const provinceData = responseValue?.placeholder2 || null;

    console.log("Extracted data:", { age: ageData, province: provinceData });
    return { ageData, provinceData };

  } catch (error) {
    console.error("Error extracting age and province:", error);
    return { ageData: null, provinceData: null };
  }
}
