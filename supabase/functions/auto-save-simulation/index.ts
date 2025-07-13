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

    // Validate simulation ID format (should be UUID-like)
    const simulationIdRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!simulationIdRegex.test(simulationId)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid simulation ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Serialize form state to handle Sets
    const serializedFormState = JSON.parse(JSON.stringify(formState, (key, value) => {
      if (value instanceof Set) {
        return Array.from(value);
      }
      return value;
    }));

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Check if auto-save already exists for this simulation
    const { data: existingAutoSave } = await supabase
      .from('saved_simulations')
      .select('id')
      .eq('simulation_id', simulationId)
      .eq('is_auto_save', true)
      .single();

    let result;
    
    if (existingAutoSave) {
      // Update existing auto-save
      result = await supabase
        .from('saved_simulations')
        .update({
          form_state: serializedFormState,
          percentage: percentage || 0,
          form_slug: formSlug || 'simulazione-mutuo',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAutoSave.id);
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
        JSON.stringify({ success: false, error: 'Database operation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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