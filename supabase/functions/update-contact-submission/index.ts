
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface ContactSubmissionRequest {
  submissionId: string
  firstName: string
  phoneNumber: string
  consulting: boolean
}

interface ContactSubmissionResponse {
  success: boolean
  error?: string
  expired?: boolean
  operations?: {
    sessionValidation: boolean
    phoneFormatting: boolean
    databaseUpdate: boolean
    whatsappMessage: boolean
    adminNotifications: boolean
  }
  timing?: {
    total: number
    sessionCheck: number
    dbUpdate: number
    whatsapp: number
    adminNotifications: number
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
  console.log(`[${requestId}] === Contact Submission Started ===`)
  
  try {
    // Parse request body
    const body: ContactSubmissionRequest = await req.json()
    const { submissionId, firstName, phoneNumber, consulting } = body
    
    console.log(`[${requestId}] Request data:`, {
      submissionId,
      firstName: firstName ? "✓ Present" : "✗ Missing",
      phoneNumber: phoneNumber ? "✓ Present" : "✗ Missing",
      consulting
    })

    // Validate required fields
    if (!submissionId || !firstName || !phoneNumber) {
      console.error(`[${requestId}] Missing required fields`)
      return Response.json({
        success: false,
        error: "Campi obbligatori mancanti"
      }, { status: 400, headers: corsHeaders })
    }

    const operations = {
      sessionValidation: false,
      phoneFormatting: false,
      databaseUpdate: false,
      whatsappMessage: false,
      adminNotifications: false
    }

    const timing = {
      total: 0,
      sessionCheck: 0,
      dbUpdate: 0,
      whatsapp: 0,
      adminNotifications: 0
    }

    // Step 1: Session Validation
    const sessionStart = Date.now()
    console.log(`[${requestId}] Step 1: Validating session...`)
    
    const { data: existingSubmission, error: checkError } = await supabase
      .from('form_submissions')
      .select('id, expires_at')
      .eq('id', submissionId)
      .single()

    timing.sessionCheck = Date.now() - sessionStart

    if (checkError) {
      console.error(`[${requestId}] Session validation error:`, checkError)
      if (checkError.code === 'PGRST116') {
        return Response.json({
          success: false,
          expired: true,
          error: "La sessione è scaduta. Ricompila il form per continuare.",
          operations,
          timing
        }, { headers: corsHeaders })
      }
      throw checkError
    }

    // Check if submission has expired
    const now = new Date()
    const expiresAt = new Date(existingSubmission.expires_at)
    
    if (now > expiresAt) {
      console.log(`[${requestId}] Session expired:`, { now: now.toISOString(), expiresAt: expiresAt.toISOString() })
      return Response.json({
        success: false,
        expired: true,
        error: "La sessione è scaduta. Ricompila il form per continuare.",
        operations,
        timing
      }, { headers: corsHeaders })
    }

    operations.sessionValidation = true
    console.log(`[${requestId}] ✅ Session validation successful (${timing.sessionCheck}ms)`)

    // Step 2: Phone Number Formatting
    console.log(`[${requestId}] Step 2: Formatting phone number...`)
    let formattedPhone = phoneNumber.replace(/\s/g, "") // Remove all spaces
    
    // Ensure it starts with +39
    if (!formattedPhone.startsWith("+39")) {
      formattedPhone = "+39" + formattedPhone
    }
    
    operations.phoneFormatting = true
    console.log(`[${requestId}] ✅ Phone formatted: ${phoneNumber} -> ${formattedPhone}`)

    // Step 3: Database Update
    const dbStart = Date.now()
    console.log(`[${requestId}] Step 3: Updating database...`)
    
    const { error: updateError } = await supabase
      .from('form_submissions')
      .update({
        first_name: firstName,
        phone_number: formattedPhone,
        consulting: consulting
      })
      .eq('id', submissionId)

    timing.dbUpdate = Date.now() - dbStart

    if (updateError) {
      console.error(`[${requestId}] Database update error:`, updateError)
      if (updateError.code === 'PGRST116') {
        return Response.json({
          success: false,
          expired: true,
          error: "La sessione è scaduta. Ricompila il form per continuare.",
          operations,
          timing
        }, { headers: corsHeaders })
      }
      throw updateError
    }

    operations.databaseUpdate = true
    console.log(`[${requestId}] ✅ Database updated successfully (${timing.dbUpdate}ms)`)

    // Step 4: Send WhatsApp Message
    const whatsappStart = Date.now()
    console.log(`[${requestId}] Step 4: Sending WhatsApp message...`)
    
    try {
      const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-ycloud-message', {
        body: {
          campaignName: consulting ? 'welcome3si' : 'welcome3no',
          destination: formattedPhone,
          userName: firstName,
          source: 'form-completion',
          media: {
            url: 'https://i.ibb.co/20RqqT9k/banner.png',
            filename: 'banner.png'
          },
          templateParams: [
            firstName
          ]
        }
      })

      timing.whatsapp = Date.now() - whatsappStart

      if (whatsappError) {
        console.error(`[${requestId}] WhatsApp message error:`, whatsappError)
        // Don't fail the entire operation for WhatsApp errors
      } else if (whatsappResult?.success) {
        operations.whatsappMessage = true
        console.log(`[${requestId}] ✅ WhatsApp message sent successfully (${timing.whatsapp}ms)`)
      } else {
        console.error(`[${requestId}] WhatsApp message failed:`, whatsappResult?.error)
      }
    } catch (whatsappError) {
      timing.whatsapp = Date.now() - whatsappStart
      console.error(`[${requestId}] WhatsApp message exception:`, whatsappError)
      // Continue execution even if WhatsApp fails
    }

    // Step 5: Send Admin Notifications (non-blocking)
    const adminStart = Date.now()
    console.log(`[${requestId}] Step 5: Sending admin notifications...`)
    
    // Send admin notifications asynchronously
    supabase.functions.invoke('send-admin-notifications', {
      body: { submissionId }
    }).then(result => {
      const adminTime = Date.now() - adminStart
      if (result.error) {
        console.error(`[${requestId}] Admin notifications error (${adminTime}ms):`, result.error)
      } else {
        console.log(`[${requestId}] ✅ Admin notifications triggered successfully (${adminTime}ms)`)
      }
    }).catch(error => {
      const adminTime = Date.now() - adminStart
      console.error(`[${requestId}] Admin notifications exception (${adminTime}ms):`, error)
    })

    // Mark admin notifications as attempted (we don't wait for completion)
    operations.adminNotifications = true
    timing.adminNotifications = Date.now() - adminStart

    // Calculate total time
    timing.total = Date.now() - startTime

    console.log(`[${requestId}] === Contact Submission Completed Successfully ===`)
    console.log(`[${requestId}] Total time: ${timing.total}ms`)
    console.log(`[${requestId}] Operations completed:`, operations)
    console.log(`[${requestId}] Timing breakdown:`, timing)

    return Response.json({
      success: true,
      operations,
      timing
    }, { headers: corsHeaders })

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] ❌ Contact submission failed after ${totalTime}ms:`, error)
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Errore imprevisto durante l'aggiornamento",
      timing: { total: totalTime }
    }, { status: 500, headers: corsHeaders })
  }
})
