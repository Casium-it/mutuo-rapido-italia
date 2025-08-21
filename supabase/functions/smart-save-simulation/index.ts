import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SmartSaveRequest {
  simulationId: string;
  formState: any;
  percentage: number;
  formSlug: string;
  saveMethod: 'auto-save' | 'manual-save' | 'completed-save';
  contactData?: {
    name: string;
    phone: string;
    email: string;
  };
}

interface SmartSaveResponse {
  success: boolean;
  resumeCode?: string;
  error?: string;
}

/**
 * Formats a date to DD/MM/YYYY format
 */
function formatDateToDDMMYYYY(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Sends WhatsApp notification for manual saves
 */
async function sendWhatsAppNotification(
  supabase: any,
  contactData: { name: string; phone: string; email: string },
  resumeCode: string,
  expiresAt: Date,
  percentage: number
): Promise<void> {
  try {
    const formattedDate = formatDateToDDMMYYYY(expiresAt);
    const firstName = contactData.name.split(' ')[0];
    
    console.log('📱 Sending WhatsApp notification to:', contactData.phone);
    
    const { data, error } = await supabase.functions.invoke('send-ycloud-message', {
      body: {
        campaignName: 'link_simulazione_salvata2',
        destination: contactData.phone,
        userName: firstName,
        source: 'simulation-saved',
        media: {
          url: 'https://i.ibb.co/xtxK7zqC/simulazione-salvata.png',
          filename: 'simulazione-salvata.png'
        },
        templateParams: [
          firstName,
          percentage.toString(),
          resumeCode,
          formattedDate
        ]
      }
    });

    if (error) {
      console.error('❌ WhatsApp notification API error:', error);
    } else {
      console.log('✅ WhatsApp notification sent successfully to:', contactData.phone);
    }
  } catch (error) {
    console.error('❌ Failed to send WhatsApp notification:', error);
    // Don't throw - notification failure shouldn't break the save
  }
}

/**
 * Handles auto-save operations
 */
async function handleAutoSave(
  supabase: any,
  data: SmartSaveRequest
): Promise<SmartSaveResponse> {
  console.log('🔄 Processing auto-save for simulation:', data.simulationId);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // For auto-save, we only update non-contact fields to preserve existing contact info
  const { error } = await supabase
    .from('saved_simulations')
    .upsert({
      simulation_id: data.simulationId,
      form_state: data.formState,
      percentage: data.percentage,
      form_slug: data.formSlug,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
      save_method: 'auto-save' as const
    }, { 
      onConflict: 'simulation_id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('❌ Auto-save database error:', error);
    return { success: false, error: `Database operation failed: ${error.message}` };
  }

  console.log('✅ Auto-save completed for simulation:', data.simulationId);
  return { success: true };
}

/**
 * Handles manual save operations
 */
async function handleManualSave(
  supabase: any,
  data: SmartSaveRequest
): Promise<SmartSaveResponse> {
  console.log('👤 Processing manual save for simulation:', data.simulationId);
  
  if (!data.contactData) {
    return { success: false, error: 'Contact data is required for manual saves' };
  }

  const { name, phone, email } = data.contactData;
  
  // Validate required contact fields
  if (!name || !phone || !email) {
    return { success: false, error: 'Name, phone, and email are required for manual saves' };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 60); // Extended expiry for manual saves

  // Check if simulation already exists to preserve existing resume code
  const { data: existingSimulation, error: queryError } = await supabase
    .from('saved_simulations')
    .select('resume_code, save_method')
    .eq('simulation_id', data.simulationId)
    .single();

  if (queryError && queryError.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('❌ Failed to query existing simulation:', queryError);
    return { success: false, error: 'Failed to check existing simulation' };
  }

  let resumeCode: string;
  let isNewSave = false;

  // Preserve existing resume code if simulation exists with one, otherwise generate new
  if (existingSimulation?.resume_code) {
    resumeCode = existingSimulation.resume_code;
    console.log('🔄 Preserving existing resume code:', resumeCode);
  } else {
    // Generate new resume code for truly new simulations
    const { data: resumeCodeData, error: resumeCodeError } = await supabase
      .rpc('generate_resume_code');

    if (resumeCodeError) {
      console.error('❌ Failed to generate resume code:', resumeCodeError);
      return { success: false, error: 'Failed to generate resume code' };
    }

    resumeCode = resumeCodeData;
    isNewSave = true;
    console.log('🆕 Generated new resume code:', resumeCode);
  }

  const upsertData = {
    simulation_id: data.simulationId,
    form_state: data.formState,
    percentage: data.percentage,
    form_slug: data.formSlug,
    expires_at: expiresAt.toISOString(),
    updated_at: new Date().toISOString(),
    save_method: 'manual-save' as const,
    resume_code: resumeCode,
    name,
    phone,
    email
  };

  const { error } = await supabase
    .from('saved_simulations')
    .upsert(upsertData, { 
      onConflict: 'simulation_id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('❌ Manual save database error:', error);
    return { success: false, error: `Database operation failed: ${error.message}` };
  }

  // Send WhatsApp notification only for new saves to avoid spam
  if (isNewSave) {
    await sendWhatsAppNotification(supabase, data.contactData, resumeCode, expiresAt, data.percentage);
    console.log('📱 WhatsApp notification sent for new save');
  } else {
    console.log('📱 Skipping WhatsApp notification for existing simulation update');
  }

  console.log('✅ Manual save completed for simulation:', data.simulationId);
  return { success: true, resumeCode };
}

/**
 * Handles completed save operations
 */
async function handleCompletedSave(
  supabase: any,
  data: SmartSaveRequest
): Promise<SmartSaveResponse> {
  console.log('🎯 Processing completed save for simulation:', data.simulationId);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90); // Extended expiry for completed forms

  // For completed saves, we only update non-contact fields to preserve existing contact info
  const { error } = await supabase
    .from('saved_simulations')
    .upsert({
      simulation_id: data.simulationId,
      form_state: data.formState,
      percentage: 100, // Always 100% for completed saves
      form_slug: data.formSlug,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
      save_method: 'completed-save' as const
    }, { 
      onConflict: 'simulation_id',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('❌ Completed save database error:', error);
    return { success: false, error: `Database operation failed: ${error.message}` };
  }

  console.log('✅ Completed save finished for simulation:', data.simulationId);
  return { success: true };
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

    const requestData: SmartSaveRequest = await req.json();
    const { simulationId, formState, percentage, formSlug, saveMethod, contactData } = requestData;

    // Validate required fields
    if (!simulationId || !formState || !formSlug || !saveMethod) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate simulation ID format
    const simulationIdRegex = /^(SIM-\d{13}-[a-zA-Z0-9]{8}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
    if (!simulationIdRegex.test(simulationId)) {
      console.error('❌ Invalid simulation ID format:', simulationId);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid simulation ID format: ${simulationId}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate save method
    if (!['auto-save', 'manual-save', 'completed-save'].includes(saveMethod)) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid save method: ${saveMethod}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚀 Smart save started - Method: ${saveMethod}, Simulation: ${simulationId}, Percentage: ${percentage}%`);

    let result: SmartSaveResponse;

    // Route to appropriate handler based on save method
    switch (saveMethod) {
      case 'auto-save':
        result = await handleAutoSave(supabase, requestData);
        break;
      case 'manual-save':
        result = await handleManualSave(supabase, requestData);
        break;
      case 'completed-save':
        result = await handleCompletedSave(supabase, requestData);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unsupported save method: ${saveMethod}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const status = result.success ? 200 : 500;
    return new Response(
      JSON.stringify(result),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Smart save function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});