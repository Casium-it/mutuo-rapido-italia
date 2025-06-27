
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, phoneNumber } = await req.json();
    
    console.log('Sending AiSensy message to:', { firstName, phoneNumber });

    const aisensyApiKey = Deno.env.get('AISENSY_API_KEY');
    if (!aisensyApiKey) {
      throw new Error('AISENSY_API_KEY not configured');
    }

    // AiSensy API call - Updated to match their documentation
    const aisensyResponse = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: aisensyApiKey,
        campaignName: 'submit form welcome1',
        destination: phoneNumber,
        userName: firstName,
        templateParams: [firstName],
        source: 'new-api-integration'
      }),
    });

    const aisensyData = await aisensyResponse.json();
    
    if (!aisensyResponse.ok) {
      console.error('AiSensy API error:', aisensyData);
      throw new Error(`AiSensy API error: ${aisensyData.message || 'Unknown error'}`);
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
