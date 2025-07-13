
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SaveSimulationRequest {
  formState: any;
  formSlug: string;
  contactData: {
    name: string;
    phone: string;
    email: string;
    percentage: number;
  };
  simulationId?: string; // Unique simulation identifier
  resumeCode?: string; // If provided, update existing
  convertFromAutoSave?: boolean; // Convert existing auto-save to user save
}

// Helper function to format date as dd/mm/yyyy
function formatDateToDDMMYYYY(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Helper function to send AiSensy message
async function sendSimulationSavedNotification(
  supabase: any,
  contactData: { name: string; phone: string; email: string },
  resumeCode: string,
  expiresAt: Date
): Promise<void> {
  try {
    console.log('🔔 Sending simulation saved WhatsApp notification...');
    
    const firstName = contactData.name.split(' ')[0];
    const expirationDate = formatDateToDDMMYYYY(expiresAt);
    
    const { data, error } = await supabase.functions.invoke('send-aisensy-message', {
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
          contactData.percentage.toString(),
          resumeCode,
          expirationDate
        ]
      }
    });

    if (error) {
      console.error('❌ Error sending simulation saved notification:', error);
      return; // Don't fail the main operation
    }

    if (!data?.success) {
      console.error('❌ AiSensy error:', data?.error);
      return; // Don't fail the main operation
    }

    console.log('✅ Simulation saved WhatsApp notification sent successfully');
    
  } catch (error) {
    console.error('❌ Unexpected error sending simulation saved notification:', error);
    // Don't fail the main operation - just log the error
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Save simulation request received');
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { formState, formSlug, contactData, simulationId, resumeCode, convertFromAutoSave }: SaveSimulationRequest = await req.json();

    // Validate required fields
    if (!formState || !formSlug || !contactData?.name || !contactData?.phone || !contactData?.email || contactData?.percentage === undefined) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Dati mancanti richiesti' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate simulation ID format if provided
    if (simulationId && typeof simulationId !== 'string') {
      console.error('❌ Invalid simulation ID format');
      return new Response(
        JSON.stringify({ success: false, error: 'ID simulazione non valido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert Sets to Arrays for JSON serialization
    const serializedFormState = {
      ...formState,
      answeredQuestions: Array.from(formState.answeredQuestions || [])
    };

    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 30); // 30 days from now

    if (resumeCode) {
      // Update existing simulation
      console.log('🔄 Updating existing simulation with code:', resumeCode);
      
      const { data, error } = await supabase
        .from('saved_simulations')
        .update({
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          form_state: serializedFormState,
          form_slug: formSlug,
          expires_at: expires_at.toISOString(),
          percentage: contactData.percentage,
          simulation_id: simulationId || null,
          updated_at: new Date().toISOString()
        })
        .eq('resume_code', resumeCode)
        .select('resume_code')
        .single();

      if (error) {
        console.error('❌ Error updating simulation:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Errore durante l\'aggiornamento della simulazione' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        console.error('❌ Simulation not found for code:', resumeCode);
        return new Response(
          JSON.stringify({ success: false, error: 'Simulazione non trovata' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send WhatsApp notification for updated simulation
      await sendSimulationSavedNotification(supabase, contactData, data.resume_code, expires_at);

      console.log('✅ Simulation updated successfully');
      return new Response(
        JSON.stringify({ 
          success: true, 
          resumeCode: data.resume_code,
          message: 'Simulazione aggiornata con successo'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (convertFromAutoSave && simulationId) {
      // Convert existing auto-save to user save
      console.log('🔄 Converting auto-save to user save for simulation:', simulationId);
      
      const { data, error } = await supabase
        .from('saved_simulations')
        .update({
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          form_state: serializedFormState,
          form_slug: formSlug,
          expires_at: expires_at.toISOString(),
          percentage: contactData.percentage,
          is_auto_save: false,
          updated_at: new Date().toISOString()
        })
        .eq('simulation_id', simulationId)
        .eq('is_auto_save', true)
        .select('resume_code')
        .single();

      if (error) {
        console.error('❌ Error converting auto-save:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Errore durante la conversione del salvataggio automatico' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!data) {
        console.log('❌ No auto-save found, creating new simulation instead');
        // Fallback: create new simulation if auto-save not found
        const { data: newData, error: newError } = await supabase
          .from('saved_simulations')
          .insert({
            name: contactData.name,
            phone: contactData.phone,
            email: contactData.email,
            form_state: serializedFormState,
            form_slug: formSlug,
            expires_at: expires_at.toISOString(),
            percentage: contactData.percentage,
            simulation_id: simulationId,
            is_auto_save: false
          })
          .select('resume_code')
          .single();

        if (newError) {
          console.error('❌ Error creating new simulation:', newError);
          return new Response(
            JSON.stringify({ success: false, error: 'Errore durante il salvataggio della simulazione' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await sendSimulationSavedNotification(supabase, contactData, newData.resume_code, expires_at);
        return new Response(
          JSON.stringify({ 
            success: true, 
            resumeCode: newData.resume_code,
            message: 'Simulazione salvata con successo'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send WhatsApp notification for converted simulation
      await sendSimulationSavedNotification(supabase, contactData, data.resume_code, expires_at);

      console.log('✅ Auto-save converted to user save successfully');
      return new Response(
        JSON.stringify({ 
          success: true, 
          resumeCode: data.resume_code,
          message: 'Simulazione salvata con successo'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // Create new simulation
      console.log('🔄 Creating new simulation');
      
      const { data, error } = await supabase
        .from('saved_simulations')
        .insert({
          name: contactData.name,
          phone: contactData.phone,
          email: contactData.email,
          form_state: serializedFormState,
          form_slug: formSlug,
          expires_at: expires_at.toISOString(),
          percentage: contactData.percentage,
          simulation_id: simulationId || null,
          is_auto_save: false
        })
        .select('resume_code')
        .single();

      if (error) {
        console.error('❌ Error creating simulation:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Errore durante il salvataggio della simulazione' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send WhatsApp notification for new simulation
      await sendSimulationSavedNotification(supabase, contactData, data.resume_code, expires_at);

      console.log('✅ New simulation created successfully');
      return new Response(
        JSON.stringify({ 
          success: true, 
          resumeCode: data.resume_code,
          message: 'Simulazione salvata con successo'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('❌ Unexpected error in save-simulation:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Errore imprevisto durante il salvataggio' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
