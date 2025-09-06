
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Load form blocks from database
async function loadFormBlocks(formSlug: string) {
  try {
    console.log(`🔍 Loading blocks for form: ${formSlug}`);
    
    const { data: formData, error } = await supabase
      .from('forms')
      .select(`
        *,
        form_blocks (
          id,
          sort_order,
          block_data
        )
      `)
      .eq('slug', formSlug)
      .eq('is_active', true)
      .single();

    if (error || !formData) {
      console.error(`❌ Form not found: ${formSlug}`, error);
      return null;
    }

    // Transform database blocks to the expected format
    const blocks = (formData.form_blocks || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((dbBlock: any) => {
        const blockData = dbBlock.block_data;
        return {
          block_number: blockData.block_number || "1",
          block_id: blockData.block_id,
          title: blockData.title || "Untitled Block",
          priority: blockData.priority || 100,
          default_active: blockData.default_active || false,
          invisible: blockData.invisible || false,
          multiBlock: blockData.multiBlock || false,
          blueprint_id: blockData.blueprint_id,
          copy_number: blockData.copy_number,
          questions: Array.isArray(blockData.questions) ? blockData.questions : [],
        };
      });

    console.log(`✅ Loaded ${blocks.length} blocks from database for form: ${formSlug}`);
    return { formData, blocks };
    
  } catch (error) {
    console.error(`💥 Error loading form blocks for ${formSlug}:`, error);
    return null;
  }
}

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
    const { formState, formSlug } = requestBody;
    
    // Validation - we no longer need blocks from client
    if (!formState || !formSlug) {
      console.error('❌ Missing required fields in request');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: formState or formSlug' 
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

    // Load form and blocks from database
    const formResult = await loadFormBlocks(formSlug);
    if (!formResult) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Form not found or inactive: ${formSlug}` 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { formData, blocks } = formResult;
    const formId = formData.id;

    // Find matching saved simulation by simulationId
    let savedSimulationId = null;
    if (formState.simulationId) {
      console.log('🔍 Looking for saved simulation with simulationId:', formState.simulationId);
      const { data: savedSimulation } = await supabase
        .from('saved_simulations')
        .select('id')
        .eq('simulation_id', formState.simulationId)
        .maybeSingle();
      
      if (savedSimulation) {
        savedSimulationId = savedSimulation.id;
        console.log('✅ Found matching saved simulation:', savedSimulationId);
      } else {
        console.log('ℹ️ No saved simulation found for simulationId:', formState.simulationId);
      }
    }

    console.log('📋 Form submission details:', {
      formSlug,
      formId,
      responseCount: Object.keys(formState.responses || {}).length,
      activeBlocks: formState.activeBlocks?.length || 0,
      completedBlocks: formState.completedBlocks?.length || 0,
      dynamicBlocks: formState.dynamicBlocks?.length || 0,
      availableBlocks: blocks.length,
      savedSimulationId
    });

    // Get referral parameter from the request if provided
    const referralId = requestBody.referralId || null;

    // Calculate expiry time (48 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Create the main submission
    console.log('💾 Creating form submission...');
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        user_identifier: referralId,
        form_id: formId,
        expires_at: expiresAt.toISOString(),
        saved_simulation_id: savedSimulationId
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

    // Prepare responses data with enhanced validation
    const responsesData = [];
    const allAvailableBlocks = [...blocks, ...(formState.dynamicBlocks || [])];
    const submittedQuestionIds = Object.keys(formState.responses);
    const foundQuestionIds: string[] = [];
    const missingQuestionIds: string[] = [];
    
    console.log('🔄 Processing form responses...');
    console.log('📊 Available blocks:', allAvailableBlocks.map(b => `${b.block_id} (${b.questions.length} questions)`));
    console.log('📋 Submitted question IDs:', submittedQuestionIds);

    for (const questionId of submittedQuestionIds) {
      // Find the question in static and dynamic blocks
      let question = null;
      let blockId = 'unknown';
      
      for (const block of allAvailableBlocks) {
        const foundQuestion = block.questions.find((q: any) => q.question_id === questionId);
        if (foundQuestion) {
          question = foundQuestion;
          blockId = block.block_id;
          foundQuestionIds.push(questionId);
          break;
        }
      }
      
      if (question) {
        const responseData = formState.responses[questionId];
        
        responsesData.push({
          submission_id: submission.id,
          question_id: questionId,
          question_text: question.question_text || 'Unknown Question',
          block_id: blockId,
          response_value: responseData
        });
      } else {
        missingQuestionIds.push(questionId);
        console.warn(`⚠️ Question not found for ID: ${questionId}`);
      }
    }

    // Log detailed validation results
    console.log('✅ Found questions:', foundQuestionIds.length);
    console.log('❌ Missing questions:', missingQuestionIds.length);
    if (missingQuestionIds.length > 0) {
      console.warn('❌ Missing question IDs:', missingQuestionIds);
      console.log('🔍 This might indicate:');
      console.log('  - Outdated cached form data on client');
      console.log('  - Client using old hardcoded blocks');
      console.log('  - Form structure mismatch between client and database');
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
    } else {
      console.warn('⚠️ No valid responses to insert');
    }

    const processingTime = Date.now() - startTime;
    console.log('🎉 Form submission completed successfully in', processingTime, 'ms');
    console.log('📊 Final stats:', {
      submissionId: submission.id,
      formId,
      formVersion: formData.version,
      responseCount: responsesData.length,
      foundQuestions: foundQuestionIds.length,
      missingQuestions: missingQuestionIds.length,
      processingTimeMs: processingTime
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        submissionId: submission.id,
        processingTime: processingTime,
        stats: {
          responsesProcessed: responsesData.length,
          questionsFound: foundQuestionIds.length,
          questionsMissing: missingQuestionIds.length
        }
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
