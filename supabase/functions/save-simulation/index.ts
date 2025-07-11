import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SaveSimulationRequest {
  formState: any;
  formSlug: string;
  contactData: {
    name: string;
    phone: string;
    email: string;
  };
  resumeCode?: string; // If provided, update existing
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Save simulation request received');
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { formState, formSlug, contactData, resumeCode }: SaveSimulationRequest = await req.json();

    // Validate required fields
    if (!formState || !formSlug || !contactData?.name || !contactData?.phone || !contactData?.email) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Dati mancanti richiesti' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert Sets to Arrays for JSON serialization
    const serializedFormState = {
      ...formState,
      answeredQuestions: Array.from(formState.answeredQuestions || [])
    };

    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30); // 30 days from now

    if (resumeCode) {
      // Update existing simulation
      console.log('🔄 Updating existing simulation with code:', resumeCode);
      
      const { data, error } = await supabase
        .from('saved_simulations')
        .update({
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          form_state: serializedFormState,
          form_slug: formSlug,
          expires_at: expires_at.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('resume_code', resumeCode)
        .select('resume_code')
        .single();

      if (error) {
        console.error('❌ Error updating simulation:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Errore durante l\'aggiornamento della simulazione' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        console.error('❌ Simulation not found for code:', resumeCode);
        return new Response(
          JSON.stringify({ success: false, error: 'Simulazione non trovata' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Simulation updated successfully');
      return new Response(
        JSON.stringify({ 
          success: true, 
          resumeCode: data.resume_code,
          message: 'Simulazione aggiornata con successo'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Create new simulation
      console.log('🔄 Creating new simulation');
      
      const { data, error } = await supabase
        .from('saved_simulations')
        .insert({
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          form_state: serializedFormState,
          form_slug: formSlug,
          expires_at: expires_at.toISOString()
        })
        .select('resume_code')
        .single();

      if (error) {
        console.error('❌ Error creating simulation:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Errore durante il salvataggio della simulazione' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ New simulation created successfully');
      return new Response(
        JSON.stringify({ 
          success: true, 
          resumeCode: data.resume_code,
          message: 'Simulazione salvata con successo'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Unexpected error in save-simulation:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Errore imprevisto durante il salvataggio' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});