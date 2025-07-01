
import { supabase } from "@/integrations/supabase/client";
import { sendCustomAisensyMessage } from "./aisensyService";

type AdminNotificationResult = {
  success: boolean;
  error?: string;
  notificationsSent?: number;
};

type MaskedAdminData = {
  admin_id: string;
  admin_display_name: string;
  phone_masked: string;
  phone_full: string;
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
    
    // 1. Fetch enabled admin notification settings using secure masked function
    const { data: maskedAdminData, error: adminError } = await supabase
      .rpc('get_masked_admin_notifications');

    if (adminError) {
      console.error("Error fetching masked admin settings:", adminError);
      return { success: false, error: "Failed to fetch admin settings" };
    }

    if (!maskedAdminData || maskedAdminData.length === 0) {
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

    // 4. Prepare message parameters (using masked data for logging)
    const submitterName = submission.first_name || "Nome non disponibile";
    const submitterAge = ageData || "Età non disponibile";
    const submitterProvince = provinceData || "Provincia non disponibile";
    const consultingStatus = submission.consulting ? "Si ✅" : "No ❌";
    const submitterPhone = submission.phone_number || "Telefono non disponibile";

    console.log("Admin notification data (privacy-safe):", {
      submissionId: submissionId,
      name: submitterName,
      age: submitterAge,
      province: submitterProvince,
      consulting: consultingStatus,
      adminCount: maskedAdminData.length
    });

    // 5. Send notifications to all enabled admins
    let successCount = 0;
    const notificationPromises = maskedAdminData.map(async (admin: MaskedAdminData) => {
      try {
        console.log(`Sending notification to admin: ${admin.admin_display_name} (${admin.phone_masked})`);
        
        const result = await sendCustomAisensyMessage({
          campaignName: 'avvisoadmin1',
          destination: admin.phone_full, // Use full phone number for sending
          userName: admin.admin_display_name, // Use masked name in template
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
          console.log(`✅ Admin notification sent successfully to ${admin.admin_display_name} (${admin.phone_masked})`);
          successCount++;
        } else {
          console.error(`❌ Failed to send notification to ${admin.admin_display_name} (${admin.phone_masked}):`, result.error);
        }
      } catch (error) {
        console.error(`❌ Error sending notification to ${admin.admin_display_name} (${admin.phone_masked}):`, error);
      }
    });

    // Wait for all notifications to complete (non-blocking for user flow)
    await Promise.allSettled(notificationPromises);

    console.log(`🎯 Admin notifications completed. Sent: ${successCount}/${maskedAdminData.length}`);
    return { success: true, notificationsSent: successCount };

  } catch (error) {
    console.error("❌ Error in sendAdminNotifications:", error);
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

    console.log("Extracted form data:", { 
      age: ageData ? "✓ Present" : "✗ Missing", 
      province: provinceData ? "✓ Present" : "✗ Missing" 
    });
    
    return { ageData, provinceData };

  } catch (error) {
    console.error("Error extracting age and province:", error);
    return { ageData: null, provinceData: null };
  }
}
