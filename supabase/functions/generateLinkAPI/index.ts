
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

interface GenerateLinkRequest {
  name: string;
  email: string;
  phone: string;
  'form-slug': string;
}

Deno.serve(async (req) => {
  console.log('🚀 Edge function triggered - generateLinkAPI invoked');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting generateLinkAPI function');
    
    if (req.method !== 'GET') {
      console.log('❌ Invalid method:', req.method);
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

    // Check API key authentication
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('PORTALE_API_KEY');

    console.log('🔑 Checking API key authentication');
    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('❌ Invalid or missing API key');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized - Invalid API key' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract query parameters
    const url = new URL(req.url);
    const name = url.searchParams.get('name');
    const email = url.searchParams.get('email');
    const phone = url.searchParams.get('phone');
    const formSlug = url.searchParams.get('form-slug');

    console.log('📥 Extracted parameters:', { name, email, phone, formSlug });

    // Validate required parameters
    if (!name || !email || !phone || !formSlug) {
      console.error('❌ Missing required parameters:', { name: !!name, email: !!email, phone: !!phone, formSlug: !!formSlug });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: name, email, phone, form-slug' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`📋 Processing request for: ${name} (${email})`);
    console.log(`📝 Form Slug: ${formSlug}`);

    // Create Supabase client with service role for bypassing RLS
    console.log('🔧 Creating Supabase client with service role');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client created successfully');

    // Step 1: Create linked form record
    console.log('💾 Creating linked form record');
    const { data: linkedForm, error: linkedFormError } = await supabase
      .from('linked_forms')
      .insert({
        name,
        phone_number: phone,
        email,
        form_slug: formSlug,
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

    // Step 2: Create saved simulation (inline logic from create-saved-simulation-linked)
    console.log('🔗 Creating saved simulation');

    // Create initial empty form state
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
    console.log('📅 Expiration date set to:', expiresAt.toISOString());

    // Insert the saved simulation
    console.log('💾 Inserting saved simulation record');
    const { data: savedSimulation, error: saveError } = await supabase
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

    if (saveError || !savedSimulation?.resume_code) {
      console.error('❌ Error creating saved simulation:', saveError);
      
      // Cleanup: delete the linked form record if simulation creation failed
      console.log('🧹 Cleaning up linked form record');
      await supabase
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

    // Step 3: Generate the final link and update linked form
    const finalLink = `https://app.gomutuo.it/riprendi/${resumeCode}`;
    
    console.log('🔗 Updating linked form with resume link:', finalLink);
    const { error: updateError } = await supabase
      .from('linked_forms')
      .update({ link: finalLink })
      .eq('id', linkedFormId);

    if (updateError) {
      console.error('❌ Error updating linked form with link:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to update linked form: ${updateError.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ Successfully created complete workflow. Final link: ${finalLink}`);

    // Return success response
    return new Response(
      JSON.stringify({
        link: finalLink,
        status: "success"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error in generateLinkAPI:', error);
    console.error('💥 Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
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
