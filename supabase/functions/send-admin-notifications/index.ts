
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface AdminNotificationRequest {
  submissionId: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] === Admin Notifications Started ===`)

  try {
    const { submissionId }: AdminNotificationRequest = await req.json()
    
    if (!submissionId) {
      console.error(`[${requestId}] Missing submissionId`)
      return Response.json({
        success: false,
        error: "Missing submissionId"
      }, { status: 400, headers: corsHeaders })
    }

    console.log(`[${requestId}] Processing admin notifications for submission:`, submissionId)

    // 1. Fetch enabled admin notification settings using secure masked function
    const { data: maskedAdminData, error: adminError } = await supabase
      .rpc('get_masked_admin_notifications')

    if (adminError) {
      console.error(`[${requestId}] Error fetching masked admin settings:`, adminError)
      return Response.json({
        success: false,
        error: "Failed to fetch admin settings"
      }, { headers: corsHeaders })
    }

    if (!maskedAdminData || maskedAdminData.length === 0) {
      console.log(`[${requestId}] No enabled admin notifications found`)
      return Response.json({
        success: true,
        notificationsSent: 0
      }, { headers: corsHeaders })
    }

    // 2. Fetch submission data
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select('first_name, phone_number, consulting')
      .eq('id', submissionId)
      .single()

    if (submissionError || !submission) {
      console.error(`[${requestId}] Error fetching submission:`, submissionError)
      return Response.json({
        success: false,
        error: "Failed to fetch submission data"
      }, { headers: corsHeaders })
    }

    // 3. Extract age and province from form responses
    const { data: responses } = await supabase
      .from('form_responses')
      .select('response_value')
      .eq('submission_id', submissionId)
      .eq('question_id', 'eta_e_citta')

    let ageData = "Età non disponibile"
    let provinceData = "Provincia non disponibile"

    if (responses && responses.length > 0) {
      const responseValue = responses[0].response_value as any
      ageData = responseValue?.placeholder1 || ageData
      provinceData = responseValue?.placeholder2 || provinceData
    }

    // 4. Prepare message parameters
    const submitterName = submission.first_name || "Nome non disponibile"
    const consultingStatus = submission.consulting ? "Si ✅" : "No ❌"
    const submitterPhone = submission.phone_number || "Telefono non disponibile"

    console.log(`[${requestId}] Admin notification data:`, {
      submissionId,
      name: "✓ Present",
      age: ageData !== "Età non disponibile" ? "✓ Present" : "✗ Missing",
      province: provinceData !== "Provincia non disponibile" ? "✓ Present" : "✗ Missing",
      consulting: consultingStatus,
      adminCount: maskedAdminData.length
    })

    // 5. Send notifications to all enabled admins
    let successCount = 0
    const notificationPromises = maskedAdminData.map(async (admin: any) => {
      try {
        console.log(`[${requestId}] Sending notification to admin: ${admin.admin_display_name} (${admin.phone_masked})`)
        
        const { data: result, error } = await supabase.functions.invoke('send-ycloud-message', {
          body: {
            templateName: 'admin_notification_new_simulation',
            destination: admin.phone_full,
            userName: admin.admin_display_name,
            source: 'admin-notification',
            templateParams: [
              submitterName,
              ageData,
              provinceData,
              consultingStatus,
              submitterPhone
            ]
          }
        })

        if (error) {
          console.error(`[${requestId}] ❌ Failed to send notification to ${admin.admin_display_name}:`, error)
        } else if (result?.success) {
          console.log(`[${requestId}] ✅ Admin notification sent successfully to ${admin.admin_display_name}`)
          successCount++
        } else {
          console.error(`[${requestId}] ❌ Notification failed for ${admin.admin_display_name}:`, result?.error)
        }
      } catch (error) {
        console.error(`[${requestId}] ❌ Error sending notification to ${admin.admin_display_name}:`, error)
      }
    })

    // Wait for all notifications to complete
    await Promise.allSettled(notificationPromises)

    console.log(`[${requestId}] 🎯 Admin notifications completed. Sent: ${successCount}/${maskedAdminData.length}`)
    
    return Response.json({
      success: true,
      notificationsSent: successCount
    }, { headers: corsHeaders })

  } catch (error) {
    console.error(`[${requestId}] ❌ Error in admin notifications:`, error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500, headers: corsHeaders })
  }
})
