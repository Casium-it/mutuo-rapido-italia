import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AiSensy API interface matching their full documentation
interface AisensyRequest {
  apiKey?: string; // Will be set from environment
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

interface AisensyRequestBody {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: AisensyRequestBody = await req.json();
    
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

    console.log('Sending AiSensy message with parameters:', {
      campaignName: requestBody.campaignName,
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

    const aisensyApiKey = Deno.env.get('AISENSY_API_KEY');
    if (!aisensyApiKey) {
      throw new Error('AISENSY_API_KEY not configured');
    }

    // Build the payload for AiSensy API, using the normalized phone number
    const aisensyPayload: AisensyRequest = {
      apiKey: aisensyApiKey,
      campaignName: requestBody.campaignName,
      destination: normalizedPhone, // Use normalized phone number
      userName: requestBody.userName,
    };

    // Add optional fields only if they are provided
    if (requestBody.source) {
      aisensyPayload.source = requestBody.source;
    }
    
    if (requestBody.media) {
      aisensyPayload.media = requestBody.media;
    }
    
    if (requestBody.templateParams && requestBody.templateParams.length > 0) {
      aisensyPayload.templateParams = requestBody.templateParams;
    }
    
    if (requestBody.tags && requestBody.tags.length > 0) {
      aisensyPayload.tags = requestBody.tags;
    }
    
    if (requestBody.attributes && Object.keys(requestBody.attributes).length > 0) {
      aisensyPayload.attributes = requestBody.attributes;
    }
    
    if (requestBody.location) {
      aisensyPayload.location = requestBody.location;
    }

    console.log('Final AiSensy payload (excluding API key):', {
      ...aisensyPayload,
      apiKey: '[REDACTED]'
    });

    // AiSensy API call
    const aisensyResponse = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aisensyPayload),
    });

    const aisensyData = await aisensyResponse.json();
    
    if (!aisensyResponse.ok) {
      console.error('AiSensy API error:', {
        status: aisensyResponse.status,
        statusText: aisensyResponse.statusText,
        response: aisensyData
      });
      throw new Error(`AiSensy API error: ${aisensyData.message || aisensyData.error || 'Unknown error'}`);
    }

    console.log('AiSensy message sent successfully:', aisensyData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'WhatsApp message sent successfully',
      aisensyResponse: aisensyData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-aisensy-message function:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending WhatsApp message' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
