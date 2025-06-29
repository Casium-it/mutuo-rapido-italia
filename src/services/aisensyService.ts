import { supabase } from "@/integrations/supabase/client";

// Type definitions for AiSensy API
export type AisensyMedia = {
  url: string;
  filename: string;
};

export type AisensyMessageParams = {
  campaignName: string;
  destination: string;
  userName: string;
  source?: string;
  media?: AisensyMedia;
  templateParams?: string[];
  tags?: string[];
  attributes?: Record<string, string>;
  location?: string;
};

export type AisensyMessageResult = {
  success: boolean;
  error?: string;
  message?: string;
  aisensyResponse?: any;
};

/**
 * Generic function to send any AiSensy message
 * @param params - Complete AiSensy message parameters
 * @returns Result of the operation
 */
export async function sendCustomAisensyMessage(
  params: AisensyMessageParams
): Promise<AisensyMessageResult> {
  try {
    console.log("Sending custom AiSensy message...", {
      campaignName: params.campaignName,
      destination: params.destination,
      userName: params.userName,
      source: params.source
    });
    
    const { data, error } = await supabase.functions.invoke('send-aisensy-message', {
      body: params
    });

    if (error) {
      console.error("Error in AiSensy function call:", error);
      throw error;
    }

    if (!data.success) {
      console.error("Error from AiSensy function:", data.error);
      return {
        success: false,
        error: data.error || "Unknown error from AiSensy"
      };
    }

    console.log("Custom AiSensy message sent successfully");
    return {
      success: true,
      message: "WhatsApp message sent successfully",
      aisensyResponse: data.aisensyResponse
    };
    
  } catch (error) {
    console.error("Error sending custom AiSensy message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error sending message"
    };
  }
}

/**
 * Send form completion message with new welcome3 campaign
 * @param firstName - User's first name
 * @param phoneNumber - Phone number in format +390000000000
 * @param consultationRequest - Whether user requested consultation
 * @returns Result of the operation
 */
export async function sendFormCompletionMessage(
  firstName: string,
  phoneNumber: string,
  consultationRequest: boolean = false
): Promise<AisensyMessageResult> {
  return sendCustomAisensyMessage({
    campaignName: 'welcome3',
    destination: phoneNumber,
    userName: firstName,
    source: 'form-completion',
    media: {
      url: '/lovable-uploads/a49fb2ba-a6fd-40cb-93aa-2806d6c5be88.png',
      filename: 'simulazione-ricevuta.png'
    },
    templateParams: [
      firstName,
      consultationRequest ? "Si ✅" : "No ❌"
    ]
  });
}

/**
 * Send notification message
 * @param campaignName - Name of the notification campaign
 * @param firstName - User's first name
 * @param phoneNumber - Phone number in format +390000000000
 * @param options - Additional options for the message
 * @returns Result of the operation
 */
export async function sendNotificationMessage(
  campaignName: string,
  firstName: string,
  phoneNumber: string,
  options?: {
    source?: string;
    templateParams?: string[];
    tags?: string[];
    attributes?: Record<string, string>;
  }
): Promise<AisensyMessageResult> {
  return sendCustomAisensyMessage({
    campaignName,
    destination: phoneNumber,
    userName: firstName,
    source: options?.source || 'notification',
    templateParams: options?.templateParams,
    tags: options?.tags,
    attributes: options?.attributes
  });
}

/**
 * Send promotional message with media support
 * @param campaignName - Name of the promotional campaign
 * @param firstName - User's first name
 * @param phoneNumber - Phone number in format +390000000000
 * @param options - Additional options for the promotional message
 * @returns Result of the operation
 */
export async function sendPromotionalMessage(
  campaignName: string,
  firstName: string,
  phoneNumber: string,
  options?: {
    source?: string;
    media?: AisensyMedia;
    templateParams?: string[];
    tags?: string[];
    attributes?: Record<string, string>;
  }
): Promise<AisensyMessageResult> {
  return sendCustomAisensyMessage({
    campaignName,
    destination: phoneNumber,
    userName: firstName,
    source: options?.source || 'promotional',
    media: options?.media,
    templateParams: options?.templateParams,
    tags: options?.tags,
    attributes: options?.attributes
  });
}

/**
 * Send message with location
 * @param campaignName - Name of the campaign
 * @param firstName - User's first name
 * @param phoneNumber - Phone number in format +390000000000
 * @param location - Location data (latitude, longitude, name & address)
 * @param options - Additional options for the message
 * @returns Result of the operation
 */
export async function sendLocationMessage(
  campaignName: string,
  firstName: string,
  phoneNumber: string,
  location: string,
  options?: {
    source?: string;
    templateParams?: string[];
    tags?: string[];
    attributes?: Record<string, string>;
  }
): Promise<AisensyMessageResult> {
  return sendCustomAisensyMessage({
    campaignName,
    destination: phoneNumber,
    userName: firstName,
    location,
    source: options?.source || 'location-based',
    templateParams: options?.templateParams,
    tags: options?.tags,
    attributes: options?.attributes
  });
}

/**
 * Backward compatibility function - uses the new form completion method
 * @deprecated Use sendFormCompletionMessage instead
 */
export async function sendAisensyMessage(
  firstName: string,
  phoneNumber: string
): Promise<AisensyMessageResult> {
  console.warn("sendAisensyMessage is deprecated, use sendFormCompletionMessage instead");
  return sendFormCompletionMessage(firstName, phoneNumber);
}
