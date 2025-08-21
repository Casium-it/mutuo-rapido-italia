import { supabase } from "@/integrations/supabase/client";

// Type definitions for YCloud API
export type YCloudMedia = {
  url: string;
  filename: string;
};

export type YCloudMessageParams = {
  templateName: string;
  destination: string;
  userName: string;
  source?: string;
  media?: YCloudMedia;
  templateParams?: string[];
  tags?: string[];
  attributes?: Record<string, string>;
  location?: string;
};

export type YCloudMessageResult = {
  success: boolean;
  error?: string;
  message?: string;
  ycloudResponse?: any;
};

/**
 * Generic function to send any YCloud template message
 * @param params - Complete YCloud message parameters
 * @returns Result of the operation
 */
export async function sendCustomYCloudMessage(
  params: YCloudMessageParams
): Promise<YCloudMessageResult> {
  try {
    console.log("Sending custom YCloud template message...", {
      templateName: params.templateName,
      destination: params.destination,
      userName: params.userName,
      source: params.source
    });
    
    const { data, error } = await supabase.functions.invoke('send-ycloud-message', {
      body: params
    });

    if (error) {
      console.error("Error in YCloud function call:", error);
      throw error;
    }

    if (!data.success) {
      console.error("Error from YCloud function:", data.error);
      return {
        success: false,
        error: data.error || "Unknown error from YCloud"
      };
    }

    console.log("Custom YCloud message sent successfully");
    return {
      success: true,
      message: "WhatsApp message sent successfully via YCloud",
      ycloudResponse: data.ycloudResponse
    };
    
  } catch (error) {
    console.error("Error sending custom YCloud message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error sending message"
    };
  }
}

/**
 * Send form completion message with new simulation_c_* templates
 * @param firstName - User's first name
 * @param phoneNumber - Phone number in format +390000000000
 * @param consultationRequest - Whether user requested consultation
 * @returns Result of the operation
 */
export async function sendFormCompletionMessage(
  firstName: string,
  phoneNumber: string,
  consultationRequest: boolean = false
): Promise<YCloudMessageResult> {
  return sendCustomYCloudMessage({
    templateName: consultationRequest ? 'simulation_c_yes' : 'simulation_c_no',
    destination: phoneNumber,
    userName: firstName,
    source: 'form-completion',
    media: {
      url: `https://i.ibb.co/20RqqT9k/banner.png`,
      filename: 'banner.png'
    },
    templateParams: [
      firstName
    ]
  });
}

/**
 * Send simulation saved message with simulation_save template
 * @param firstName - User's first name
 * @param phoneNumber - Phone number in format +390000000000
 * @param resumeCode - The simulation resume code
 * @param expirationDate - Expiration date in dd/mm/yyyy format
 * @returns Result of the operation
 */
export async function sendSimulationSavedMessage(
  firstName: string,
  phoneNumber: string,
  resumeCode: string,
  expirationDate: string
): Promise<YCloudMessageResult> {
  return sendCustomYCloudMessage({
    templateName: 'simulation_save',
    destination: phoneNumber,
    userName: firstName,
    source: 'simulation-saved',
    media: {
      url: 'https://i.ibb.co/DfWNjp7g/simulazione-salvata.png',
      filename: 'simulazione-salvata.png'
    },
    templateParams: [
      firstName,
      resumeCode,
      expirationDate
    ]
  });
}

/**
 * Send notification message
 * @param templateName - Name of the YCloud template
 * @param firstName - User's first name
 * @param phoneNumber - Phone number in format +390000000000
 * @param options - Additional options for the message
 * @returns Result of the operation
 */
export async function sendNotificationMessage(
  templateName: string,
  firstName: string,
  phoneNumber: string,
  options?: {
    source?: string;
    templateParams?: string[];
    tags?: string[];
    attributes?: Record<string, string>;
  }
): Promise<YCloudMessageResult> {
  return sendCustomYCloudMessage({
    templateName,
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
 * @param templateName - Name of the YCloud template
 * @param firstName - User's first name
 * @param phoneNumber - Phone number in format +390000000000
 * @param options - Additional options for the promotional message
 * @returns Result of the operation
 */
export async function sendPromotionalMessage(
  templateName: string,
  firstName: string,
  phoneNumber: string,
  options?: {
    source?: string;
    media?: YCloudMedia;
    templateParams?: string[];
    tags?: string[];
    attributes?: Record<string, string>;
  }
): Promise<YCloudMessageResult> {
  return sendCustomYCloudMessage({
    templateName,
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
 * @param templateName - Name of the YCloud template
 * @param firstName - User's first name
 * @param phoneNumber - Phone number in format +390000000000
 * @param location - Location data (latitude, longitude, name & address)
 * @param options - Additional options for the message
 * @returns Result of the operation
 */
export async function sendLocationMessage(
  templateName: string,
  firstName: string,
  phoneNumber: string,
  location: string,
  options?: {
    source?: string;
    templateParams?: string[];
    tags?: string[];
    attributes?: Record<string, string>;
  }
): Promise<YCloudMessageResult> {
  return sendCustomYCloudMessage({
    templateName,
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
export async function sendYCloudMessage(
  firstName: string,
  phoneNumber: string
): Promise<YCloudMessageResult> {
  console.warn("sendYCloudMessage is deprecated, use sendFormCompletionMessage instead");
  return sendFormCompletionMessage(firstName, phoneNumber);
}