
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
  saveMethod?: 'auto-save' | 'manual-save' | 'completed-save';
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

    const { simulationId, formState, percentage, formSlug, saveMethod }: AutoSaveRequest = await req.json();

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

    console.log('🔄 Auto-saving simulation:', simulationId, 'with method:', saveMethod || 'auto-save');
    console.log('📝 Received answeredQuestions:', formState.answeredQuestions, 'Type:', typeof formState.answeredQuestions, 'IsArray:', Array.isArray(formState.answeredQuestions));

    // Simple handling since formState now comes pre-serialized from client
    const serializedFormState = formState;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Determine save method - default to auto-save if not specified
    const finalSaveMethod = saveMethod || 'auto-save';
    
    // Use UPSERT to handle both insert and update atomically - prevents race conditions
    const upsertData = {
      simulation_id: simulationId,
      form_state: serializedFormState,
      percentage: percentage || 0,
      form_slug: formSlug || 'simulazione-mutuo',
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
      save_method: finalSaveMethod,
      // Contact fields are left NULL for auto-save (will be preserved if they exist)
      name: null,
      phone: null,
      email: null
    };

    const { error: upsertError } = await supabase
      .from('saved_simulations')
      .upsert(upsertData, { 
        onConflict: 'simulation_id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error('Database upsert error:', upsertError);
      return new Response(
        JSON.stringify({ success: false, error: `Database operation failed: ${upsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('💾 Auto-save upsert completed for simulation:', simulationId);

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
