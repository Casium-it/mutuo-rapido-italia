import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface SaveSimulationRequest {
  formState: any
  contactData: {
    name: string
    phone: string
    email: string
  }
  formSlug: string
  existingResumeCode?: string
}

interface SaveSimulationResponse {
  success: boolean
  resumeCode?: string
  error?: string
}

// Phone validation function (server-side)
function validateAndFormatItalianPhone(phone: string): {
  isValid: boolean
  formattedPhone: string
  error?: string
} {
  if (!phone || phone.trim().length === 0) {
    return {
      isValid: false,
      formattedPhone: phone,
      error: "Il numero di telefono è obbligatorio"
    }
  }

  // Remove all spaces and formatting
  let cleanPhone = phone.replace(/\s+/g, "")
  
  // If it doesn't start with +39, add it
  if (!cleanPhone.startsWith("+39")) {
    // If it starts with 39, add the +
    if (cleanPhone.startsWith("39")) {
      cleanPhone = "+" + cleanPhone
    } 
    // If it starts with 3 (typical Italian mobile), add +39
    else if (cleanPhone.startsWith("3")) {
      cleanPhone = "+39" + cleanPhone
    }
    // Otherwise add +39
    else {
      cleanPhone = "+39" + cleanPhone
    }
  }

  // Italian mobile numbers: +39 followed by 10 digits (total 13 characters)
  if (!/^\+39\d{10}$/.test(cleanPhone)) {
    return {
      isValid: false,
      formattedPhone: cleanPhone,
      error: "Inserisci un numero di telefono italiano valido (es. +39 123 456 7890)"
    }
  }

  return {
    isValid: true,
    formattedPhone: cleanPhone
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
  console.log(`[${requestId}] === Save Simulation Started ===`)
  
  try {
    // Parse request body
    const body: SaveSimulationRequest = await req.json()
    const { formState, contactData, formSlug, existingResumeCode } = body
    
    console.log(`[${requestId}] Request data:`, {
      hasFormState: !!formState,
      contactName: contactData.name ? "✓ Present" : "✗ Missing",
      contactPhone: contactData.phone ? "✓ Present" : "✗ Missing",
      contactEmail: contactData.email ? "✓ Present" : "✗ Missing",
      formSlug,
      existingResumeCode: existingResumeCode ? "✓ Present" : "✗ Not provided"
    })

    // Validate required fields
    if (!contactData.name?.trim()) {
      return Response.json({
        success: false,
        error: "Il nome è obbligatorio"
      }, { status: 400, headers: corsHeaders })
    }

    if (!contactData.email?.trim()) {
      return Response.json({
        success: false,
        error: "L'email è obbligatoria"
      }, { status: 400, headers: corsHeaders })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contactData.email)) {
      return Response.json({
        success: false,
        error: "Inserisci un indirizzo email valido"
      }, { status: 400, headers: corsHeaders })
    }

    // Validate and format phone number
    const phoneValidation = validateAndFormatItalianPhone(contactData.phone)
    if (!phoneValidation.isValid) {
      return Response.json({
        success: false,
        error: phoneValidation.error
      }, { status: 400, headers: corsHeaders })
    }

    console.log(`[${requestId}] Validation passed, formatted phone:`, phoneValidation.formattedPhone)

    // Convert Set to Array for JSON serialization
    const serializedFormState = {
      ...formState,
      answeredQuestions: formState.answeredQuestions ? Array.from(formState.answeredQuestions) : []
    }

    let resumeCode: string
    let operation: string

    if (existingResumeCode) {
      // Update existing simulation
      console.log(`[${requestId}] Updating existing simulation with code:`, existingResumeCode)
      
      const { data: existingData, error: selectError } = await supabase
        .from('saved_simulations')
        .select('id')
        .eq('resume_code', existingResumeCode.toUpperCase())
        .gt('expires_at', new Date().toISOString())
        .single()

      if (selectError || !existingData) {
        console.error(`[${requestId}] Existing simulation not found:`, selectError)
        return Response.json({
          success: false,
          error: "Simulazione esistente non trovata o scaduta"
        }, { status: 404, headers: corsHeaders })
      }

      const { error: updateError } = await supabase
        .from('saved_simulations')
        .update({
          name: contactData.name.trim(),
          phone: phoneValidation.formattedPhone,
          email: contactData.email.trim(),
          form_state: serializedFormState,
          form_slug: formSlug,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingData.id)

      if (updateError) {
        console.error(`[${requestId}] Update error:`, updateError)
        return Response.json({
          success: false,
          error: "Errore durante l'aggiornamento della simulazione"
        }, { status: 500, headers: corsHeaders })
      }

      resumeCode = existingResumeCode
      operation = 'updated'
    } else {
      // Create new simulation
      console.log(`[${requestId}] Creating new simulation`)

      const { data, error } = await supabase
        .from('saved_simulations')
        .insert({
          name: contactData.name.trim(),
          phone: phoneValidation.formattedPhone,
          email: contactData.email.trim(),
          form_state: serializedFormState,
          form_slug: formSlug
        })
        .select('resume_code')
        .single()

      if (error) {
        console.error(`[${requestId}] Insert error:`, error)
        return Response.json({
          success: false,
          error: "Errore durante il salvataggio della simulazione"
        }, { status: 500, headers: corsHeaders })
      }

      if (!data?.resume_code) {
        console.error(`[${requestId}] No resume code returned`)
        return Response.json({
          success: false,
          error: "Errore nella generazione del codice di ripresa"
        }, { status: 500, headers: corsHeaders })
      }

      resumeCode = data.resume_code
      operation = 'created'
    }

    const totalTime = Date.now() - startTime
    console.log(`[${requestId}] === Save Simulation Completed Successfully ===`)
    console.log(`[${requestId}] Operation: ${operation}, Resume code: ${resumeCode}, Total time: ${totalTime}ms`)

    return Response.json({
      success: true,
      resumeCode
    }, { headers: corsHeaders })

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] ❌ Save simulation failed after ${totalTime}ms:`, error)
    
    return Response.json({
      success: false,
      error: "Errore imprevisto durante il salvataggio della simulazione"
    }, { status: 500, headers: corsHeaders })
  }
})
