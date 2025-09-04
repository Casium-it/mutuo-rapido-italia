
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
    const { data: ageResponses } = await supabase
      .from('form_responses')
      .select('response_value')
      .eq('submission_id', submissionId)
      .eq('question_id', 'eta')

    const { data: provinceResponses } = await supabase
      .from('form_responses')
      .select('response_value')
      .eq('submission_id', submissionId)
      .eq('question_id', 'provincia_residenza')

    let ageData = "Età non disponibile"
    let provinceData = "Provincia non disponibile"

    if (ageResponses && ageResponses.length > 0) {
      const ageValue = ageResponses[0].response_value as any
      ageData = ageValue?.placeholder1 || ageData
    }

    if (provinceResponses && provinceResponses.length > 0) {
      const provinceValue = provinceResponses[0].response_value as any
      provinceData = provinceValue?.placeholder1 || provinceData
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
        console.log(`[${requestId}] 📧 Starting notification process for admin: ${admin.admin_display_name} (${admin.phone_masked})`)
        
        // First, try to generate PDF
        let templateName = 'admin_notification_new_simulation'
        let pdfMedia = undefined

        console.log(`[${requestId}] 🔄 Phase 1: Starting PDF generation process for submission: ${submissionId}`)
        
        try {
          const pdfStartTime = Date.now()
          console.log(`[${requestId}] 📞 Invoking generate-lead-pdf function...`)
          
          const { data: pdfResult, error: pdfError } = await supabase.functions.invoke('generate-lead-pdf', {
            body: { submissionId }
          })

          const pdfEndTime = Date.now()
          console.log(`[${requestId}] 📄 PDF Generation Response (${pdfEndTime - pdfStartTime}ms):`, {
            hasError: !!pdfError,
            errorDetails: pdfError,
            hasData: !!pdfResult,
            success: pdfResult?.success,
            hasPdfUrl: !!pdfResult?.pdfUrl,
            pdfUrl: pdfResult?.pdfUrl ? `${pdfResult.pdfUrl.substring(0, 50)}...` : 'MISSING',
            filename: pdfResult?.filename,
            fullResultKeys: pdfResult ? Object.keys(pdfResult) : [],
            fullResult: pdfResult
          })

          if (pdfError) {
            console.error(`[${requestId}] ❌ PDF generation failed with error:`, {
              errorType: typeof pdfError,
              errorMessage: pdfError?.message || pdfError,
              errorStack: pdfError?.stack,
              fullError: pdfError
            })
            console.warn(`[${requestId}] ⚠️  Falling back to text-only notification due to PDF error`)
          } else if (pdfResult?.success && pdfResult?.pdfUrl) {
            console.log(`[${requestId}] ✅ PDF generation SUCCESS - switching to PDF template`)
            templateName = 'admin_notification_new_simulation_pdf'
            pdfMedia = {
              url: pdfResult.pdfUrl,
              filename: pdfResult.filename || 'lead_details.pdf'
            }
            console.log(`[${requestId}] 📎 PDF media object created:`, {
              url: `${pdfMedia.url.substring(0, 50)}...`,
              filename: pdfMedia.filename,
              urlLength: pdfMedia.url.length,
              isValidUrl: pdfMedia.url.startsWith('http')
            })
          } else {
            console.warn(`[${requestId}] ⚠️  PDF generation returned unsuccessful result:`, {
              hasResult: !!pdfResult,
              success: pdfResult?.success,
              pdfUrl: pdfResult?.pdfUrl,
              resultType: typeof pdfResult,
              resultKeys: pdfResult ? Object.keys(pdfResult) : [],
              fullResult: pdfResult
            })
            console.warn(`[${requestId}] ⚠️  Falling back to text-only notification due to invalid PDF result`)
          }
        } catch (pdfGenerationError) {
          console.error(`[${requestId}] 💥 PDF generation EXCEPTION:`, {
            errorName: pdfGenerationError?.name,
            errorMessage: pdfGenerationError?.message,
            errorStack: pdfGenerationError?.stack,
            errorType: typeof pdfGenerationError,
            fullError: pdfGenerationError
          })
          console.warn(`[${requestId}] ⚠️  Falling back to text-only notification due to PDF exception`)
        }

         // Template selection confirmation
        console.log(`[${requestId}] 🎯 Phase 2: Template Selection Complete:`, {
          selectedTemplate: templateName,
          isPdfTemplate: templateName.includes('_pdf'),
          hasPdfMedia: !!pdfMedia,
          mediaDetails: pdfMedia ? {
            hasUrl: !!pdfMedia.url,
            hasFilename: !!pdfMedia.filename,
            urlPreview: pdfMedia.url ? `${pdfMedia.url.substring(0, 50)}...` : null,
            filename: pdfMedia.filename
          } : 'NO_PDF_MEDIA'
        })

        console.log(`[${requestId}] 📨 Phase 3: Preparing YCloud message:`, {
          templateName,
          destination: admin.phone_masked, // Don't log full phone
          userName: admin.admin_display_name,
          source: 'admin-notification',
          hasMedia: !!pdfMedia,
          mediaType: pdfMedia ? 'PDF_DOCUMENT' : 'NONE',
          templateParamsCount: 5,
          templateParams: {
            consulting: consultingStatus,
            name: submitterName,
            age: ageData,
            province: provinceData,
            phone: submitterPhone ? `${submitterPhone.substring(0, 6)}...` : 'MISSING'
          }
        })

        const ycloudStartTime = Date.now()
        const { data: result, error } = await supabase.functions.invoke('send-ycloud-message', {
          body: {
            templateName,
            destination: admin.phone_full,
            userName: admin.admin_display_name,
            source: 'admin-notification',
            media: pdfMedia,
            templateParams: [
              consultingStatus,
              submitterName,
              ageData,
              provinceData,
              submitterPhone
            ]
          }
        })

        const ycloudEndTime = Date.now()
        console.log(`[${requestId}] 📬 Phase 4: YCloud Response (${ycloudEndTime - ycloudStartTime}ms):`, {
          hasError: !!error,
          hasResult: !!result,
          resultSuccess: result?.success,
          errorDetails: error,
          ycloudResponseKeys: result ? Object.keys(result) : [],
          ycloudMessage: result?.message,
          ycloudResponse: result?.ycloudResponse,
          fullResult: result,
          fullError: error
        })

        if (error) {
          console.error(`[${requestId}] ❌ YCloud invocation failed for ${admin.admin_display_name}:`, {
            errorType: typeof error,
            errorMessage: error?.message || error,
            errorStack: error?.stack,
            fullError: error
          })
        } else if (result?.success) {
          const notificationType = pdfMedia ? 'PDF notification' : 'text notification'
          console.log(`[${requestId}] ✅ ${notificationType} sent successfully to ${admin.admin_display_name}:`, {
            templateUsed: templateName,
            hadPdfAttachment: !!pdfMedia,
            ycloudSuccess: result.success,
            ycloudMessage: result.message
          })
          successCount++
        } else {
          console.error(`[${requestId}] ❌ YCloud returned unsuccessful result for ${admin.admin_display_name}:`, {
            resultSuccess: result?.success,
            resultError: result?.error,
            resultMessage: result?.message,
            fullResult: result
          })
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
    console.error(`[${requestId}] ❌ Error in admin notifications:`, {
      errorName: error?.name,
      errorMessage: error?.message,
      errorStack: error?.stack,
      errorType: typeof error,
      submissionId,
      processedAdmins: maskedAdminData?.length || 0,
      successfulNotifications: successCount,
      fullError: error
    })
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500, headers: corsHeaders })
  }
})
