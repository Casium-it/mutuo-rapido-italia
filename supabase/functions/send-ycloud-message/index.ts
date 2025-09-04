import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// YCloud API interface
interface YCloudRequestBody {
  templateName: string;
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

// Media URL mapping for YCloud templates
const TEMPLATE_MEDIA_MAPPING: Record<string, string> = {
  'simulation_c_yes': 'https://i.ibb.co/20RqqT9k/banner.png',
  'simulation_c_no': 'https://i.ibb.co/20RqqT9k/banner.png',
  'simulation_save': 'https://i.ibb.co/DfWNjp7g/simulazione-salvata.png',
  'admin_notification_new_simulation': '',
  'admin_notification_new_simulation_pdf': '',
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
  
  // Check if this is a PDF template that should use document header
  const isPdfTemplate = templateName.includes('_pdf');
  
  console.log(`📋 Building template components:`, {
    templateName,
    isPdfTemplate,
    hasMedia: !!media,
    mediaDetails: media ? {
      hasUrl: !!media.url,
      hasFilename: !!media.filename,
      urlLength: media.url?.length,
      filename: media.filename
    } : null,
    templateParamsCount: templateParams.length,
    defaultMediaUrl: TEMPLATE_MEDIA_MAPPING[templateName]
  });
  
  // Add header component if media is provided or template has default media
  const mediaUrl = media?.url || TEMPLATE_MEDIA_MAPPING[templateName];
  if (mediaUrl) {
    if (isPdfTemplate) {
      // For PDF templates, use document header
      const documentComponent = {
        type: 'header',
        parameters: [
          {
            type: 'document',
            document: { 
              link: mediaUrl,
              filename: media?.filename || 'document.pdf'
            }
          }
        ]
      };
      console.log(`📎 Adding DOCUMENT header component:`, {
        type: 'document',
        link: `${mediaUrl.substring(0, 50)}...`,
        filename: media?.filename || 'document.pdf',
        fullComponent: documentComponent
      });
      components.push(documentComponent);
    } else {
      // For other templates, use image header
      const imageComponent = {
        type: 'header',
        parameters: [
          {
            type: 'image',
            image: { link: mediaUrl }
          }
        ]
      };
      console.log(`🖼️  Adding IMAGE header component:`, {
        type: 'image',
        link: `${mediaUrl.substring(0, 50)}...`,
        fullComponent: imageComponent
      });
      components.push(imageComponent);
    }
  } else {
    console.log(`⚠️  No media URL found for template: ${templateName}`);
  }
  
  // Add body component with parameters
  if (templateParams && templateParams.length > 0) {
    const bodyComponent = {
      type: 'body',
      parameters: templateParams.map(param => ({
        type: 'text',
        text: param
      }))
    };
    console.log(`📝 Adding BODY component:`, {
      parametersCount: templateParams.length,
      parameters: templateParams.map((p, i) => `[${i}]: ${String(p).substring(0, 30)}...`),
      fullComponent: bodyComponent
    });
    components.push(bodyComponent);
  }
  
  console.log(`✅ Template components built successfully:`, {
    totalComponents: components.length,
    componentTypes: components.map(c => c.type),
    hasDocumentHeader: components.some(c => c.parameters?.[0]?.type === 'document'),
    hasImageHeader: components.some(c => c.parameters?.[0]?.type === 'image'),
    hasBodyParameters: components.some(c => c.type === 'body')
  });
  
  return components;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] === YCloud Message Started ===`)

  try {
    console.log(`[${requestId}] 📨 Parsing request body...`)
    const requestBody: YCloudRequestBody = await req.json();
    
    console.log(`[${requestId}] 📨 YCloud request received:`, {
      templateName: requestBody.templateName,
      destination: requestBody.destination ? `${requestBody.destination.substring(0, 6)}...` : 'MISSING',
      userName: requestBody.userName,
      source: requestBody.source,
      hasMedia: !!requestBody.media,
      mediaDetails: requestBody.media ? {
        hasUrl: !!requestBody.media.url,
        hasFilename: !!requestBody.media.filename,
        urlLength: requestBody.media.url?.length,
        filename: requestBody.media.filename,
        urlPreview: requestBody.media.url ? `${requestBody.media.url.substring(0, 50)}...` : null
      } : null,
      templateParamsCount: requestBody.templateParams?.length || 0,
      tagsCount: requestBody.tags?.length || 0,
      attributesCount: Object.keys(requestBody.attributes || {}).length,
      hasLocation: !!requestBody.location
    });
    
    // Validate required fields
    if (!requestBody.templateName) {
      console.error(`[${requestId}] ❌ Missing templateName`)
      throw new Error('templateName is required');
    }
    if (!requestBody.destination) {
      console.error(`[${requestId}] ❌ Missing destination`)
      throw new Error('destination is required');
    }
    if (!requestBody.userName) {
      console.error(`[${requestId}] ❌ Missing userName`)
      throw new Error('userName is required');
    }

    const templateName = requestBody.templateName;
    
    console.log(`[${requestId}] 🔄 Phase 1: Processing phone number...`)
    // Normalize the phone number for validation and API call
    const normalizedPhone = normalizePhoneNumber(requestBody.destination);
    
    console.log(`[${requestId}] 📞 Phone number processing:`, {
      original: requestBody.destination,
      normalized: normalizedPhone,
      lengthOriginal: requestBody.destination.length,
      lengthNormalized: normalizedPhone.length
    })
    
    // Validate phone number format
    if (!validatePhoneNumber(normalizedPhone)) {
      console.error(`[${requestId}] ❌ Phone number validation failed:`, {
        original: requestBody.destination,
        normalized: normalizedPhone,
        expectedFormat: '+39xxxxxxxxx (or other international format)'
      });
      throw new Error(`destination must be a valid phone number with country code (e.g., +39xxxxxxxxx). Received: "${requestBody.destination}"`);
    }

    console.log(`[${requestId}] 🔄 Phase 2: Checking API key...`)
    const ycloudApiKey = Deno.env.get('YCLOUD_API_KEY');
    if (!ycloudApiKey) {
      console.error(`[${requestId}] ❌ YCLOUD_API_KEY not configured`)
      throw new Error('YCLOUD_API_KEY not configured');
    }
    console.log(`[${requestId}] ✅ API key found: ${ycloudApiKey.substring(0, 10)}...`)

    console.log(`[${requestId}] 🔄 Phase 3: Building template components...`)
    // Build template components
    const templateComponents = buildTemplateComponents(
      templateName, 
      requestBody.templateParams, 
      requestBody.media
    );

    console.log(`[${requestId}] 🔄 Phase 4: Building YCloud payload...`)
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

    console.log(`[${requestId}] 📋 Final YCloud payload summary:`, {
      type: ycloudPayload.type,
      templateName: ycloudPayload.template.name,
      language: ycloudPayload.template.language.code,
      componentsCount: ycloudPayload.template.components.length,
      componentTypes: ycloudPayload.template.components.map(c => c.type),
      hasDocumentComponent: ycloudPayload.template.components.some(c => 
        c.parameters?.[0]?.type === 'document'
      ),
      from: ycloudPayload.from,
      to: `${ycloudPayload.to.substring(0, 6)}...`
    });

    console.log(`[${requestId}] 📋 Complete YCloud payload:`, JSON.stringify(ycloudPayload, null, 2));

    console.log(`[${requestId}] 🔄 Phase 5: Sending to YCloud API...`)
    const apiStartTime = Date.now()
    
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

    const apiEndTime = Date.now()
    console.log(`[${requestId}] 📡 YCloud API response received (${apiEndTime - apiStartTime}ms):`, {
      status: ycloudResponse.status,
      statusText: ycloudResponse.statusText,
      ok: ycloudResponse.ok,
      headers: Object.fromEntries(ycloudResponse.headers.entries())
    })

    const ycloudData = await ycloudResponse.json();
    
    console.log(`[${requestId}] 📡 YCloud response data:`, {
      hasData: !!ycloudData,
      dataKeys: ycloudData ? Object.keys(ycloudData) : [],
      fullData: ycloudData
    })
    
    if (!ycloudResponse.ok) {
      console.error(`[${requestId}] ❌ YCloud API error:`, {
        status: ycloudResponse.status,
        statusText: ycloudResponse.statusText,
        response: ycloudData,
        payloadSent: ycloudPayload
      });
      throw new Error(`YCloud API error: ${ycloudData.message || ycloudData.error || 'Unknown error'}`);
    }

    console.log(`[${requestId}] ✅ YCloud message sent successfully:`, {
      success: true,
      templateUsed: templateName,
      destination: `${normalizedPhone.substring(0, 6)}...`,
      ycloudData
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'WhatsApp message sent successfully via YCloud',
      ycloudResponse: ycloudData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const requestId = crypto.randomUUID()
    console.error(`[${requestId}] ❌ Error in send-ycloud-message function:`, {
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
      errorType: typeof error,
      requestMethod: req.method,
      requestUrl: req.url,
      fullError: error
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending WhatsApp message' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
