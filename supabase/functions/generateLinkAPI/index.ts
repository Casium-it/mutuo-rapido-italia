
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

interface GenerateLinkParams {
  name: string;
  email: string;
  phone: string;
  'form-slug': string;
  apikey: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting generateLinkAPI function');

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Method not allowed. Use GET.' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract query parameters from URL
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const formSlug = searchParams.get('form-slug');
    const apikey = searchParams.get('apikey');

    console.log('📋 Received parameters:', { name, email, phone, formSlug, hasApikey: !!apikey });

    // Validate API key
    const expectedApiKey = Deno.env.get('PORTALE_API_KEY');
    if (!apikey || !expectedApiKey || apikey !== expectedApiKey) {
      console.error('❌ Invalid or missing API key');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid API key' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required parameters
    if (!name || !email || !phone || !formSlug) {
      console.error('❌ Missing required parameters');
      const missingParams = [];
      if (!name) missingParams.push('name');
      if (!email) missingParams.push('email');
      if (!phone) missingParams.push('phone');
      if (!formSlug) missingParams.push('form-slug');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Missing required parameters: ${missingParams.join(', ')}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role for bypassing RLS
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('💾 Creating linked form record');

    // Step 1: Create linked form record
    const { data: linkedForm, error: linkedFormError } = await supabaseServiceRole
      .from('linked_forms')
      .insert({
        name: name.trim(),
        phone_number: phone.trim(),
        email: email.trim(),
        form_slug: formSlug.trim(),
        state: 'active',
        percentage: 0
      })
      .select('id')
      .single();

    if (linkedFormError || !linkedForm) {
      console.error('❌ Error creating linked form:', linkedFormError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create linked form: ${linkedFormError?.message || 'Unknown error'}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const linkedFormId = linkedForm.id;
    console.log(`✅ Linked form created with ID: ${linkedFormId}`);

    // Step 2: Create saved simulation linked to the form
    console.log('🔗 Creating linked saved simulation');

    // Create initial empty form state (same as starting a new simulation)
    const initialFormState = {
      activeBlocks: [],
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

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Insert the saved simulation
    const { data: savedSimulation, error: saveError } = await supabaseServiceRole
      .from('saved_simulations')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        form_state: initialFormState,
        form_slug: formSlug.trim(),
        linked_form_id: linkedFormId,
        expires_at: expiresAt.toISOString()
      })
      .select('resume_code')
      .single();

    if (saveError || !savedSimulation?.resume_code) {
      console.error('❌ Error creating saved simulation:', saveError);
      
      // Cleanup: Delete the linked form record if simulation creation failed
      await supabaseServiceRole
        .from('linked_forms')
        .delete()
        .eq('id', linkedFormId);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to create saved simulation: ${saveError?.message || 'No resume code generated'}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const resumeCode = savedSimulation.resume_code;
    console.log(`✅ Saved simulation created with resume code: ${resumeCode}`);

    // Step 3: Update linked form with the resume link
    const resumeLink = `https://app.gomutuo.it/riprendi/${resumeCode}`;
    console.log(`🔗 Updating linked form with resume link: ${resumeLink}`);

    const { error: updateError } = await supabaseServiceRole
      .from('linked_forms')
      .update({ link: resumeLink })
      .eq('id', linkedFormId);

    if (updateError) {
      console.error('❌ Error updating linked form with resume link:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to update linked form with resume link: ${updateError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Successfully generated linked form and simulation');

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        link: resumeLink,
        status: 'active',
        linkedFormId: linkedFormId,
        message: 'Link generated successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error in generateLinkAPI:', error);
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
