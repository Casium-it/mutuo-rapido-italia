
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateLinkedSimulationRequest {
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
    console.log('🔄 Starting create-saved-simulation-linked function');
    
    // Create Supabase client with service role for bypassing RLS
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed. Use POST.' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { name, phone, email, formSlug, linkedFormId }: CreateLinkedSimulationRequest = await req.json();

    // Validate required parameters
    if (!name || !phone || !email || !formSlug || !linkedFormId) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: name, phone, email, formSlug, linkedFormId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📋 Processing linked simulation for: ${name} (${email})`);
    console.log(`🔗 Linked Form ID: ${linkedFormId}`);
    console.log(`📝 Form Slug: ${formSlug}`);

    // Verify that the linkedFormId exists
    const { data: linkedForm, error: linkedFormError } = await supabaseServiceRole
      .from('linked_forms')
      .select('id, form_slug')
      .eq('id', linkedFormId)
      .single();

    if (linkedFormError || !linkedForm) {
      console.error('❌ Linked form not found:', linkedFormError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Linked form not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create initial empty form state (same as starting a new simulation)
    const initialFormState = {
      activeBlocks: [], // Will be populated when first loaded
      activeQuestion: {
        block_id: '',
        question_id: ''
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

    console.log('💾 Creating saved simulation with initial empty state');

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Insert the saved simulation
    const { data: savedSimulation, error: saveError } = await supabaseServiceRole
      .from('saved_simulations')
      .insert({
        name,
        phone,
        email,
        form_state: initialFormState,
        form_slug: formSlug,
        linked_form_id: linkedFormId,
        expires_at: expiresAt.toISOString()
      })
      .select('resume_code')
      .single();

    if (saveError) {
      console.error('❌ Error saving simulation:', saveError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create saved simulation: ${saveError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!savedSimulation?.resume_code) {
      console.error('❌ No resume code generated');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to generate resume code' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Successfully created linked saved simulation with resume code: ${savedSimulation.resume_code}`);

    return new Response(
      JSON.stringify({
        success: true,
        resumeCode: savedSimulation.resume_code,
        linkedFormId: linkedFormId,
        message: 'Linked saved simulation created successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error in create-saved-simulation-linked:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
