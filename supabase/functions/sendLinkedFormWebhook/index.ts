
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting sendLinkedFormWebhook function');
    
    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check API key configuration
    const apiKey = Deno.env.get("PORTALE_API_KEY");
    if (!apiKey) {
      console.error('❌ PORTALE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: "API key not configured" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    let eventData;
    try {
      eventData = await req.json();
      console.log('📥 Received event data:', eventData);
    } catch (error) {
      console.error('❌ Invalid JSON in request body:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON in request body' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare webhook payload
    const webhookPayload = {
      event_type: eventData.event_type || 'notification_settings_changed',
      timestamp: new Date().toISOString(),
      data: eventData.data || {},
      source: 'go_mutuo_admin_dashboard'
    };

    console.log('📤 Sending webhook to external endpoint');
    console.log('🎯 Payload:', webhookPayload);

    // Send POST request to external webhook endpoint
    const webhookUrl = 'https://mufcmhgxskkwggtwryol.supabase.co/functions/v1/receiveFormWebhook';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });

    console.log('📡 Webhook response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Webhook failed:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Webhook delivery failed',
          status: response.status,
          details: errorText
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const responseData = await response.text();
    console.log('✅ Webhook sent successfully:', responseData);

    // Return 200 OK as requested
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook sent successfully',
        webhook_response: responseData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error in sendLinkedFormWebhook:', error);
    console.error('💥 Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error?.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
