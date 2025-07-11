
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface ResumeSimulationRequest {
  resumeCode: string
}

interface ResumeSimulationResponse {
  success: boolean
  data?: {
    formState: any
    formSlug: string
    contactInfo: {
      name: string
      phone: string
      email: string
    }
  }
  error?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
  console.log(`[${requestId}] === Resume Simulation Started ===`)
  
  try {
    // Parse request body
    const body: ResumeSimulationRequest = await req.json()
    const { resumeCode } = body
    
    console.log(`[${requestId}] Request data:`, {
      resumeCode: resumeCode ? "✓ Present" : "✗ Missing",
      codeLength: resumeCode?.length
    })

    // Validate resume code format
    if (!resumeCode || !/^[A-Z0-9]{8}$/.test(resumeCode.toUpperCase())) {
      console.error(`[${requestId}] Invalid resume code format:`, resumeCode)
      return Response.json({
        success: false,
        error: "Formato del codice di ripresa non valido. Deve essere di 8 caratteri alfanumerici."
      }, { status: 400, headers: corsHeaders })
    }

    console.log(`[${requestId}] Querying database for resume code:`, resumeCode.toUpperCase())
    
    // Query saved simulation with service role permissions
    const { data, error } = await supabase
      .from('saved_simulations')
      .select('*')
      .eq('resume_code', resumeCode.toUpperCase())
      .gt('expires_at', new Date().toISOString())
      .single()

    console.log(`[${requestId}] Database query result:`, {
      dataFound: !!data,
      error: error?.message,
      errorCode: error?.code
    })

    if (error) {
      if (error.code === 'PGRST116') {
        console.error(`[${requestId}] Simulation not found or expired`)
        return Response.json({
          success: false,
          error: "Simulazione non trovata o scaduta"
        }, { status: 404, headers: corsHeaders })
      }
      
      console.error(`[${requestId}] Database error:`, error)
      return Response.json({
        success: false,
        error: "Errore durante il caricamento della simulazione"
      }, { status: 500, headers: corsHeaders })
    }

    if (!data) {
      console.error(`[${requestId}] No data returned from query`)
      return Response.json({
        success: false,
        error: "Simulazione non trovata o scaduta"
      }, { status: 404, headers: corsHeaders })
    }

    console.log(`[${requestId}] Simulation found:`, {
      id: data.id,
      name: data.name,
      formSlug: data.form_slug,
      createdAt: data.created_at
    })
    
    // Prepare response data
    const responseData = {
      formState: data.form_state,
      formSlug: data.form_slug,
      contactInfo: {
        name: data.name,
        phone: data.phone,
        email: data.email
      }
    }

    const totalTime = Date.now() - startTime
    console.log(`[${requestId}] === Resume Simulation Completed Successfully ===`)
    console.log(`[${requestId}] Total time: ${totalTime}ms`)

    return Response.json({
      success: true,
      data: responseData
    }, { headers: corsHeaders })

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`[${requestId}] ❌ Resume simulation failed after ${totalTime}ms:`, error)
    
    return Response.json({
      success: false,
      error: "Errore imprevisto durante il caricamento della simulazione"
    }, { status: 500, headers: corsHeaders })
  }
})
