
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateSavedSimulationLinkedRequest {
  name: string;
  phone: string;
  email: string;
  formSlug: string;
  linkedFormId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Create saved simulation linked request received');
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { name, phone, email, formSlug, linkedFormId }: CreateSavedSimulationLinkedRequest = await req.json();

    // Validate required fields
    if (!name || !phone || !email || !formSlug || !linkedFormId) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Tutti i campi sono obbligatori (name, phone, email, formSlug, linkedFormId)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify that the linked form exists
    console.log('🔍 Checking if linked form exists:', linkedFormId);
    const { data: linkedForm, error: linkedFormError } = await supabase
      .from('linked_forms')
      .select('id, form_slug')
      .eq('id', linkedFormId)
      .single();

    if (linkedFormError || !linkedForm) {
      console.error('❌ Linked form not found:', linkedFormError);
      return new Response(
        JSON.stringify({ success: false, error: 'Form collegato non trovato' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create initial empty FormState - same as the initial state in FormContext
    const initialFormState = {
      activeBlocks: [],
      activeQuestion: {
        block_id: "introduzione",
        question_id: "soggetto_acquisto"
      },
      responses: {},
      answeredQuestions: [],
      isNavigating: false,
      navigationHistory: [],
      dynamicBlocks: [],
      blockActivations: {},
      completedBlocks: [],
      pendingRemovals: []
    };

    console.log('🔄 Creating saved simulation with initial state');

    // Set expiration date (30 days from now)
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30);

    // Create the saved simulation linked to the form
    const { data, error } = await supabase
      .from('saved_simulations')
      .insert({
        name: name,
        phone: phone,
        email: email,
        form_state: initialFormState,
        form_slug: formSlug,
        linked_form: linkedFormId,
        expires_at: expires_at.toISOString()
      })
      .select('resume_code')
      .single();

    if (error) {
      console.error('❌ Error creating saved simulation:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Errore durante la creazione della simulazione' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data?.resume_code) {
      console.error('❌ Resume code not generated');
      return new Response(
        JSON.stringify({ success: false, error: 'Codice di ripresa non generato' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Saved simulation created successfully with resume code:', data.resume_code);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        resumeCode: data.resume_code,
        linkedFormId: linkedFormId,
        message: 'Simulazione collegata creata con successo'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Unexpected error in create-saved-simulation-linked:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Errore imprevisto durante la creazione' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
