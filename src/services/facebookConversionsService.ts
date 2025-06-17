
import { supabase } from "@/integrations/supabase/client";

interface ConversionEventData {
  eventName: string;
  eventSourceUrl?: string;
  userAgent?: string;
  phoneNumber?: string;
  customData?: { [key: string]: any };
}

export const sendFacebookConversionEvent = async (eventData: ConversionEventData) => {
  try {
    console.log('Sending Facebook Conversion event:', eventData.eventName);
    
    // Prepare the payload
    const payload = {
      eventName: eventData.eventName,
      eventSourceUrl: eventData.eventSourceUrl || window.location.href,
      userAgent: eventData.userAgent || navigator.userAgent,
      phoneNumber: eventData.phoneNumber,
      customData: eventData.customData
    };

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('facebook-conversions', {
      body: payload
    });

    if (error) {
      console.error('Facebook Conversion API error:', error);
      return { success: false, error };
    }

    console.log('Facebook Conversion API success:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Error sending Facebook Conversion event:', error);
    return { success: false, error };
  }
};

// Helper functions for specific events
export const trackSubmitApplication = async (phoneNumber?: string) => {
  return sendFacebookConversionEvent({
    eventName: 'SubmitApplication',
    phoneNumber,
    customData: {
      content_category: 'mortgage_application'
    }
  });
};

export const trackCustomizeProduct = async () => {
  return sendFacebookConversionEvent({
    eventName: 'CustomizeProduct',
    customData: {
      content_category: 'mortgage_simulation'
    }
  });
};
