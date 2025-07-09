
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // POST /linked-forms-api/create - Create a new linked form
    if (req.method === 'POST' && path === '/linked-forms-api/create') {
      const {
        external_service_id,
        form_slug,
        webhook_url,
        redirect_url,
        completion_behavior = 'funnel',
        expires_in_hours = 48,
        metadata = {}
      } = await req.json();

      console.log('Creating linked form:', { external_service_id, form_slug, completion_behavior });

      // Find the form by slug
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('id, title')
        .eq('slug', form_slug)
        .eq('is_active', true)
        .single();

      if (formError || !form) {
        console.error('Form not found:', formError);
        return new Response(
          JSON.stringify({ success: false, error: 'Form non trovato o non attivo' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expires_in_hours);

      // Create linked form
      const { data: linkedForm, error: createError } = await supabase
        .from('linked_forms')
        .insert({
          external_service_id,
          form_id: form.id,
          webhook_url,
          redirect_url,
          completion_behavior,
          metadata,
          expires_at: expiresAt.toISOString()
        })
        .select('link_token, expires_at')
        .single();

      if (createError) {
        console.error('Error creating linked form:', createError);
        return new Response(
          JSON.stringify({ success: false, error: 'Errore nella creazione del form collegato' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const accessUrl = `${Deno.env.get('SUPABASE_URL')?.replace('https://', 'https://').replace('.supabase.co', '')}/linked-form/${linkedForm.link_token}`;

      console.log('Linked form created successfully:', linkedForm.link_token);

      return new Response(
        JSON.stringify({
          success: true,
          link_token: linkedForm.link_token,
          access_url: accessUrl,
          expires_at: linkedForm.expires_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /linked-forms-api/{token}/status - Get form status
    if (req.method === 'GET' && path.includes('/status')) {
      const token = path.split('/')[2]; // Extract token from path
      
      console.log('Getting status for token:', token);

      const { data: linkedForm, error: linkedFormError } = await supabase
        .from('linked_forms')
        .select(`
          *,
          form_submissions!linked_form_id (
            id,
            created_at,
            first_name,
            phone_number,
            consulting
          )
        `)
        .eq('link_token', token)
        .single();

      if (linkedFormError || !linkedForm) {
        console.error('Linked form not found:', linkedFormError);
        return new Response(
          JSON.stringify({ success: false, error: 'Form collegato non trovato' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Determine status
      let status = 'not_started';
      if (linkedForm.form_submissions && linkedForm.form_submissions.length > 0) {
        const submission = linkedForm.form_submissions[0];
        if (submission.first_name && submission.phone_number) {
          status = 'completed';
        } else {
          status = 'in_progress';
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          status,
          progress_percentage: linkedForm.progress_percentage,
          last_accessed_at: linkedForm.last_accessed_at,
          external_service_id: linkedForm.external_service_id,
          form_submissions: linkedForm.form_submissions || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Endpoint non trovato' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Errore interno del server' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
