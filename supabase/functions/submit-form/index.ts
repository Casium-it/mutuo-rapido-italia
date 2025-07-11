
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('🚀 Form submission request received');
    const startTime = Date.now();
    
    // Parse request body
    const requestBody = await req.json();
    const { formState, blocks, formSlug } = requestBody;
    
    console.log('📋 Form submission details:', {
      formSlug,
      responseCount: Object.keys(formState.responses || {}).length,
      activeBlocks: formState.activeBlocks?.length || 0,
      completedBlocks: formState.completedBlocks?.length || 0,
      dynamicBlocks: formState.dynamicBlocks?.length || 0
    });

    // Validation
    if (!formState || !blocks || !formSlug) {
      console.error('❌ Missing required fields in request');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: formState, blocks, or formSlug' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!formState.responses || Object.keys(formState.responses).length === 0) {
      console.error('❌ No responses found in form state');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No form responses provided' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get referral parameter from the request if provided
    const referralId = requestBody.referralId || null;
    
    // Get form info from database
    console.log('🔍 Looking up form info for slug:', formSlug);
    const { data: formInfo, error: formInfoError } = await supabase
      .from('forms')
      .select('form_type')
      .eq('slug', formSlug)
      .eq('is_active', true)
      .single();

    if (formInfoError || !formInfo) {
      console.error('❌ Form not found for slug:', formSlug, formInfoError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Form not found for slug: ${formSlug}` 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formType = formInfo.form_type;
    console.log('✅ Form found, type:', formType);

    // Calculate expiry time (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Create the main submission
    console.log('💾 Creating form submission...');
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        user_identifier: referralId,
        form_type: formType,
        expires_at: expiresAt.toISOString(),
        metadata: { 
          blocks: formState.activeBlocks,
          completedBlocks: formState.completedBlocks,
          dynamicBlocks: formState.dynamicBlocks?.length || 0,
          submissionSource: 'edge_function'
        }
      })
      .select('id')
      .single();

    if (submissionError) {
      console.error('❌ Error creating submission:', submissionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create form submission',
          details: submissionError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Submission created with ID:', submission.id);

    // Prepare responses data
    const responsesData = [];
    const allAvailableBlocks = [...blocks, ...(formState.dynamicBlocks || [])];
    
    console.log('🔄 Processing form responses...');
    for (const questionId in formState.responses) {
      // Find the question in static and dynamic blocks
      let question = allAvailableBlocks
        .flatMap(block => block.questions)
        .find(q => q.question_id === questionId);
      
      if (question) {
        // Find the correct block_id
        let blockId = allAvailableBlocks.find(
          block => block.questions.some(q => q.question_id === questionId)
        )?.block_id;
        
        const responseData = formState.responses[questionId];
        
        responsesData.push({
          submission_id: submission.id,
          question_id: questionId,
          question_text: question.question_text,
          block_id: blockId || 'unknown',
          response_value: responseData
        });
      } else {
        console.warn('⚠️ Question not found for ID:', questionId);
      }
    }
    
    // Insert all responses
    if (responsesData.length > 0) {
      console.log('💾 Inserting', responsesData.length, 'responses...');
      const { error: responsesError } = await supabase
        .from('form_responses')
        .insert(responsesData);
      
      if (responsesError) {
        console.error('❌ Error inserting responses:', responsesError);
        // Try to clean up the submission
        await supabase.from('form_submissions').delete().eq('id', submission.id);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to save form responses',
            details: responsesError.message 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('✅ Successfully inserted', responsesData.length, 'responses');
    }

    const processingTime = Date.now() - startTime;
    console.log('🎉 Form submission completed successfully in', processingTime, 'ms');
    console.log('📊 Final stats:', {
      submissionId: submission.id,
      formType,
      responseCount: responsesData.length,
      processingTimeMs: processingTime
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        submissionId: submission.id,
        processingTime: processingTime
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error in form submission:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error during form submission',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
