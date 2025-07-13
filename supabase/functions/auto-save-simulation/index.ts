
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AutoSaveRequest {
  simulationId: string;
  formState: any;
  percentage: number;
  formSlug: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { simulationId, formState, percentage, formSlug }: AutoSaveRequest = await req.json();

    // Validate required fields
    if (!simulationId || !formState) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate simulation ID format (should be SIM-{timestamp}-{random} or UUID)
    const simulationIdRegex = /^(SIM-\d{13}-[a-zA-Z0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
    if (!simulationIdRegex.test(simulationId)) {
      console.error('Invalid simulation ID format:', simulationId);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid simulation ID format: ${simulationId}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Auto-saving simulation:', simulationId);
    console.log('📝 Received answeredQuestions:', formState.answeredQuestions, 'Type:', typeof formState.answeredQuestions, 'IsArray:', Array.isArray(formState.answeredQuestions));

    // Simple handling since formState now comes pre-serialized from client
    const serializedFormState = formState;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Check if ANY record exists for this simulation (auto-save or user-save) - FIX: use maybeSingle()
    const { data: existingRecord, error: queryError } = await supabase
      .from('saved_simulations')
      .select('id, is_auto_save')
      .eq('simulation_id', simulationId)
      .maybeSingle();

    if (queryError) {
      console.error('Database query error:', queryError);
      return new Response(
        JSON.stringify({ success: false, error: `Database query failed: ${queryError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;
    
    if (existingRecord) {
      // Update existing record (whether it's auto-save or user-save)
      result = await supabase
        .from('saved_simulations')
        .update({
          form_state: serializedFormState,
          percentage: percentage || 0,
          form_slug: formSlug || 'simulazione-mutuo',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
          // Keep it as auto-save if it was already auto-save, otherwise preserve user-save status
          is_auto_save: existingRecord.is_auto_save
        })
        .eq('id', existingRecord.id);
    } else {
      // Create new auto-save record
      result = await supabase
        .from('saved_simulations')
        .insert({
          simulation_id: simulationId,
          form_state: serializedFormState,
          percentage: percentage || 0,
          form_slug: formSlug || 'simulazione-mutuo',
          expires_at: expiresAt.toISOString(),
          is_auto_save: true,
          // Contact fields are left NULL for auto-save
          name: null,
          phone: null,
          email: null
        });
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return new Response(
        JSON.stringify({ success: false, error: `Database operation failed: ${result.error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Auto-save completed successfully for simulation:', simulationId, 'with', serializedFormState.answeredQuestions?.length || 0, 'answered questions');
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Auto-save function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
