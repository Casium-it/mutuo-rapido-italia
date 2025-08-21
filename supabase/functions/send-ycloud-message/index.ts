import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// YCloud API interface
interface YCloudRequestBody {
  campaignName: string;
  destination: string;
  userName: string;
  source?: string;
  media?: {
    url: string;
    filename: string;
  };
  templateParams?: string[];
  tags?: string[];
  attributes?: Record<string, string>;
  location?: string;
}

// Template mapping from old campaigns to new YCloud templates
const CAMPAIGN_TEMPLATE_MAPPING: Record<string, string> = {
  'welcome3si': 'simulation_c_yes',
  'welcome3no': 'simulation_c_no',
  'link_simulazione_salvata': 'simulation_save',
  'link_simulazione_salvata2': 'simulation_save',
  'avvisoadmin1': 'admin_notification_new_simulation',
  'reminderadmin1': 'admin_notification_reminder'
};

// Media URL mapping
const TEMPLATE_MEDIA_MAPPING: Record<string, string> = {
  'simulation_c_yes': 'https://i.ibb.co/20RqqT9k/banner.png',
  'simulation_c_no': 'https://i.ibb.co/20RqqT9k/banner.png',
  'simulation_save': 'https://i.ibb.co/DfWNjp7g/simulazione-salvata.png',
  'admin_notification_new_simulation': '',
  'admin_notification_reminder': ''
};

// Utility function to clean and normalize phone numbers
function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all spaces, dashes, and other formatting characters, but keep the +
  return phoneNumber.replace(/[\s\-\(\)\.]/g, '');
}

// Utility function to validate phone number format
function validatePhoneNumber(phoneNumber: string): boolean {
  // Clean the phone number first
  const cleanPhone = normalizePhoneNumber(phoneNumber);
  
  // Italian phone number with country code: +39 followed by 8-11 digits
  // Also supports other international formats: + followed by 1-3 digit country code and 4-14 digits
  const phoneRegex = /^\+\d{1,3}\d{4,14}$/;
  
  return phoneRegex.test(cleanPhone);
}

// Build YCloud template components
function buildTemplateComponents(templateName: string, templateParams: string[] = [], media?: { url: string; filename: string; }): any[] {
  const components: any[] = [];
  
  // Add header component if media is provided or template has default media
  const mediaUrl = media?.url || TEMPLATE_MEDIA_MAPPING[templateName];
  if (mediaUrl) {
    components.push({
      type: 'header',
      parameters: [
        {
          type: 'image',
          image: { link: mediaUrl }
        }
      ]
    });
  }
  
  // Add body component with parameters
  if (templateParams && templateParams.length > 0) {
    components.push({
      type: 'body',
      parameters: templateParams.map(param => ({
        type: 'text',
        text: param
      }))
    });
  }
  
  return components;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: YCloudRequestBody = await req.json();
    
    // Validate required fields
    if (!requestBody.campaignName) {
      throw new Error('campaignName is required');
    }
    if (!requestBody.destination) {
      throw new Error('destination is required');
    }
    if (!requestBody.userName) {
      throw new Error('userName is required');
    }

    // Map old campaign name to new template name
    const templateName = CAMPAIGN_TEMPLATE_MAPPING[requestBody.campaignName] || requestBody.campaignName;
    
    // Normalize the phone number for validation and API call
    const normalizedPhone = normalizePhoneNumber(requestBody.destination);
    
    // Validate phone number format
    if (!validatePhoneNumber(normalizedPhone)) {
      console.error('Phone number validation failed:', {
        original: requestBody.destination,
        normalized: normalizedPhone,
        expectedFormat: '+39xxxxxxxxx (or other international format)'
      });
      throw new Error(`destination must be a valid phone number with country code (e.g., +39xxxxxxxxx). Received: "${requestBody.destination}"`);
    }

    console.log('Sending YCloud message with parameters:', {
      originalCampaign: requestBody.campaignName,
      templateName: templateName,
      destination: requestBody.destination,
      normalizedDestination: normalizedPhone,
      userName: requestBody.userName,
      source: requestBody.source,
      hasMedia: !!requestBody.media,
      templateParamsCount: requestBody.templateParams?.length || 0,
      tagsCount: requestBody.tags?.length || 0,
      attributesCount: Object.keys(requestBody.attributes || {}).length,
      hasLocation: !!requestBody.location
    });

    const ycloudApiKey = Deno.env.get('YCLOUD_API_KEY');
    if (!ycloudApiKey) {
      throw new Error('YCLOUD_API_KEY not configured');
    }

    // Build template components
    const templateComponents = buildTemplateComponents(
      templateName, 
      requestBody.templateParams, 
      requestBody.media
    );

    // Build the payload for YCloud API
    const ycloudPayload = {
      type: 'template',
      template: {
        language: { code: 'it' },
        name: templateName,
        components: templateComponents
      },
      from: '+393518681491',
      to: normalizedPhone
    };

    console.log('Final YCloud payload:', JSON.stringify(ycloudPayload, null, 2));

    // YCloud API call
    const ycloudResponse = await fetch('https://api.ycloud.com/v2/whatsapp/messages/sendDirectly', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-API-Key': ycloudApiKey,
      },
      body: JSON.stringify(ycloudPayload),
    });

    const ycloudData = await ycloudResponse.json();
    
    if (!ycloudResponse.ok) {
      console.error('YCloud API error:', {
        status: ycloudResponse.status,
        statusText: ycloudResponse.statusText,
        response: ycloudData
      });
      throw new Error(`YCloud API error: ${ycloudData.message || ycloudData.error || 'Unknown error'}`);
    }

    console.log('YCloud message sent successfully:', ycloudData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'WhatsApp message sent successfully via YCloud',
      ycloudResponse: ycloudData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-ycloud-message function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending WhatsApp message' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
