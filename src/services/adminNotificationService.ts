
import { supabase } from "@/integrations/supabase/client";

type AdminNotificationResult = {
  success: boolean;
  error?: string;
  notificationsSent?: number;
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
 * Send admin notifications for a form submission using secure edge function
 * @param submissionId - ID of the form submission
 * @returns Result of the notification operation
 */
export async function sendAdminNotifications(
  submissionId: string
): Promise<AdminNotificationResult> {
  try {
    console.log("Sending admin notifications for submission:", submissionId);
    
    // Use the secure edge function that has service role access
    const { data, error } = await supabase.functions.invoke('send-admin-notifications', {
      body: { submissionId }
    });

    if (error) {
      console.error("Error calling admin notifications edge function:", error);
      return { 
        success: false, 
        error: "Failed to send admin notifications" 
      };
    }

    if (!data?.success) {
      console.error("Admin notifications edge function returned error:", data?.error);
      return { 
        success: false, 
        error: data?.error || "Failed to send admin notifications" 
      };
    }

    console.log(`✅ Admin notifications sent successfully. Count: ${data.notificationsSent || 0}`);
    
    return {
      success: true,
      notificationsSent: data.notificationsSent || 0
    };

  } catch (error) {
    console.error("❌ Error in sendAdminNotifications:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
