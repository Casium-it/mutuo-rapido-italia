
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

interface ResumeSimulationRequest {
  resumeCode: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting resume-simulation function');
    
    // Create Supabase client with service role for secure access
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

    const { resumeCode }: ResumeSimulationRequest = await req.json();

    if (!resumeCode) {
      console.error('❌ Resume code is required');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Resume code is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate resume code format
    if (!/^[A-Z0-9]{8}$/.test(resumeCode.toUpperCase())) {
      console.error('❌ Invalid resume code format:', resumeCode);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Formato del codice di ripresa non valido. Deve essere di 8 caratteri alfanumerici.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Looking up simulation with resume code:', resumeCode.toUpperCase());

    // Query the saved simulation with secure service role access
    const { data: simulation, error: queryError } = await supabaseServiceRole
      .from('saved_simulations')
      .select('*')
      .eq('resume_code', resumeCode.toUpperCase())
      .gt('expires_at', new Date().toISOString())
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        console.error('❌ Simulation not found or expired');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Simulazione non trovata o scaduta' 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.error('❌ Database query error:', queryError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Errore durante il caricamento della simulazione' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!simulation) {
      console.error('❌ No simulation data returned');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Simulazione non trovata' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Simulation found successfully');

    // Get the form state
    let formState = simulation.form_state;

    // Check if activeQuestion is empty and implement fallback logic
    if (!formState.activeQuestion?.block_id || !formState.activeQuestion?.question_id) {
      console.log('🔧 Active question is empty, implementing fallback logic');
      
      try {
        // Find the form by slug
        const { data: form, error: formError } = await supabaseServiceRole
          .from('forms')
          .select('id')
          .eq('slug', simulation.form_slug)
          .eq('is_active', true)
          .single();

        if (formError || !form) {
          console.error('❌ Could not find form for slug:', simulation.form_slug);
        } else {
          // Get the first block (ordered by sort_order)
          const { data: firstBlock, error: blockError } = await supabaseServiceRole
            .from('form_blocks')
            .select('block_data')
            .eq('form_id', form.id)
            .order('sort_order', { ascending: true })
            .limit(1)
            .single();

          if (blockError || !firstBlock) {
            console.error('❌ Could not find first block for form:', form.id);
          } else {
            // Extract the block_id and first question from block_data
            const blockData = firstBlock.block_data;
            const blockId = blockData.block_id;
            const questions = blockData.questions || [];
            
            if (questions.length > 0) {
              const firstQuestion = questions[0];
              const questionId = firstQuestion.id;
              
              // Update formState with fallback values
              formState = {
                ...formState,
                activeQuestion: {
                  block_id: blockId,
                  question_id: questionId
                },
                activeBlocks: formState.activeBlocks?.length > 0 ? formState.activeBlocks : [blockId]
              };
              
              console.log(`✅ Applied fallback: activeQuestion set to ${blockId}/${questionId}`);
            } else {
              console.error('❌ No questions found in first block');
            }
          }
        }
      } catch (fallbackError) {
        console.error('❌ Error in fallback logic:', fallbackError);
        // Continue with original formState if fallback fails
      }
    }

    // Prepare response data
    const responseData = {
      formState: formState,
      formSlug: simulation.form_slug,
      simulationId: simulation.simulation_id, // Include simulation ID for session tracking
      contactInfo: {
        name: simulation.name,
        phone: simulation.phone,
        email: simulation.email
      },
      linkedFormId: simulation.linked_form_id // Include linked form ID if present
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: responseData,
        message: 'Simulation resumed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error in resume-simulation:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
