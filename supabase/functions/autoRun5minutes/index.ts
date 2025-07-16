import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  lead_status: string;
  consulting: boolean;
  prossimo_contatto: string;
  assigned_to: string;
  admin_name: string;
  admin_phone: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const aisensyApiKey = Deno.env.get('AISENSY_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting 5-minute auto run check...');

    // Calculate time window: now + 20 minutes
    const now = new Date();
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);

    console.log(`Checking for reminders between ${now.toISOString()} and ${twentyMinutesFromNow.toISOString()}`);

    // Query leads that need reminders
    const { data: leads, error } = await supabase
      .from('form_submissions')
      .select(`
        id,
        first_name,
        last_name,
        phone_number,
        lead_status,
        consulting,
        prossimo_contatto,
        assigned_to,
        admin_notification_settings!inner(
          admin_name,
          phone_number as admin_phone
        )
      `)
      .eq('reminder', true)
      .eq('reminder_sent', false)
      .not('prossimo_contatto', 'is', null)
      .not('assigned_to', 'is', null)
      .gte('prossimo_contatto', now.toISOString())
      .lte('prossimo_contatto', twentyMinutesFromNow.toISOString());

    if (error) {
      console.error('Error fetching leads:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch leads' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${leads?.length || 0} leads requiring reminders`);

    if (!leads || leads.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const successfulReminders = [];
    const failedReminders = [];

    // Process each lead
    for (const lead of leads) {
      try {
        const leadData = lead as any;
        const adminData = leadData.admin_notification_settings;
        
        // Format the scheduled time as HH:MM
        const scheduledTime = new Date(leadData.prossimo_contatto);
        const timeFormatted = scheduledTime.toLocaleTimeString('it-IT', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });

        // Prepare AiSensy message parameters
        const consultingText = leadData.consulting ? 'Si ✅' : 'No ❌';
        const leadName = `${leadData.first_name || ''} ${leadData.last_name || ''}`.trim();
        const leadPhone = leadData.phone_number?.startsWith('+39') 
          ? leadData.phone_number 
          : `+39${leadData.phone_number}`;

        const messageParams = [
          adminData.admin_name,           // 1 - admin name
          '20',                          // 2 - difference in minutes (hardcoded 20)
          timeFormatted,                 // 3 - scheduled time (xx:xx format)
          leadName,                      // 4 - lead name
          leadData.lead_status,          // 5 - lead status
          consultingText,                // 6 - consulting (Si ✅ or No ❌)
          leadPhone                      // 7 - lead phone number
        ];

        console.log(`Sending reminder for lead ${leadData.id} to admin ${adminData.admin_name}`);

        // Send AiSensy message
        const aisensyResponse = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-AiSensy-API-Key': aisensyApiKey,
          },
          body: JSON.stringify({
            campaignName: 'reminderadmin1',
            destination: adminData.admin_phone,
            userName: 'GoMutui',
            templateParams: messageParams,
            source: 'new-api',
            media: {},
            buttons: {},
            carouselCards: [],
            location: {},
            paramsFallbackValue: {
              FirstName: leadName
            }
          }),
        });

        if (!aisensyResponse.ok) {
          const errorText = await aisensyResponse.text();
          console.error(`AiSensy API error for lead ${leadData.id}:`, errorText);
          failedReminders.push({
            leadId: leadData.id,
            error: `AiSensy API error: ${aisensyResponse.status}`
          });
          continue;
        }

        const aisensyResult = await aisensyResponse.json();
        console.log(`AiSensy response for lead ${leadData.id}:`, aisensyResult);

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('form_submissions')
          .update({ reminder_sent: true })
          .eq('id', leadData.id);

        if (updateError) {
          console.error(`Error updating reminder_sent for lead ${leadData.id}:`, updateError);
          failedReminders.push({
            leadId: leadData.id,
            error: 'Failed to update reminder_sent status'
          });
        } else {
          successfulReminders.push({
            leadId: leadData.id,
            adminName: adminData.admin_name,
            scheduledTime: timeFormatted
          });
        }

      } catch (error) {
        console.error(`Error processing lead ${lead.id}:`, error);
        failedReminders.push({
          leadId: lead.id,
          error: error.message
        });
      }
    }

    console.log(`Reminder processing complete. Success: ${successfulReminders.length}, Failed: ${failedReminders.length}`);

    return new Response(JSON.stringify({
      message: 'Reminder processing complete',
      successful: successfulReminders.length,
      failed: failedReminders.length,
      successfulReminders,
      failedReminders
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fatal error in autoRun5minutes:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});