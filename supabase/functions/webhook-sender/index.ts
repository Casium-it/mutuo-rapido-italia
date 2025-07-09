
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      link_token,
      event_type,
      data = {}
    } = await req.json();

    console.log('Sending webhook:', { link_token, event_type });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get linked form details
    const { data: linkedForm, error } = await supabase
      .from('linked_forms')
      .select('webhook_url, external_service_id, progress_percentage')
      .eq('link_token', link_token)
      .single();

    if (error || !linkedForm || !linkedForm.webhook_url) {
      console.log('No webhook URL found for token:', link_token);
      return new Response(
        JSON.stringify({ success: true, message: 'Nessun webhook configurato' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare webhook payload
    const payload = {
      event: event_type,
      link_token,
      external_service_id: linkedForm.external_service_id,
      timestamp: new Date().toISOString(),
      data: {
        progress_percentage: linkedForm.progress_percentage,
        ...data
      }
    };

    console.log('Sending webhook to:', linkedForm.webhook_url);

    // Send webhook
    const webhookResponse = await fetch(linkedForm.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'GoMutui-Webhook/1.0'
      },
      body: JSON.stringify(payload)
    });

    const success = webhookResponse.ok;
    console.log('Webhook sent:', { success, status: webhookResponse.status });

    return new Response(
      JSON.stringify({ 
        success,
        webhook_status: webhookResponse.status,
        webhook_response: success ? 'delivered' : 'failed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Errore nell\'invio del webhook' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
