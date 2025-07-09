
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateLinkRequest {
  form_slug: string;
}

interface CreateLinkResponse {
  link: string;
  token: string;
  expires_at: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate HTTP method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get API key from environment
    const CRM_API_KEY = Deno.env.get('CRM_API_KEY')
    if (!CRM_API_KEY) {
      console.error('CRM_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate API key
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey || apiKey !== CRM_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const body: CreateLinkRequest = await req.json()
    
    if (!body.form_slug || typeof body.form_slug !== 'string') {
      return new Response(
        JSON.stringify({ error: 'form_slug is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify form exists and is active
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, slug, is_active')
      .eq('slug', body.form_slug)
      .eq('is_active', true)
      .single()

    if (formError || !form) {
      return new Response(
        JSON.stringify({ error: 'Form not found or inactive' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get CRM webhook URL
    const CRM_WEBHOOK_URL = Deno.env.get('CRM_WEBHOOK_URL')
    if (!CRM_WEBHOOK_URL) {
      console.error('CRM_WEBHOOK_URL not configured')
      return new Response(
        JSON.stringify({ error: 'Webhook configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate token (28 days expiry)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 28)

    // Call the database function to generate a unique token
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_linked_form_token')

    if (tokenError) {
      console.error('Token generation error:', tokenError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate token' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = tokenData as string

    // Create linked form record
    const { error: insertError } = await supabase
      .from('linked_forms')
      .insert({
        token,
        form_slug: body.form_slug,
        expires_at: expiresAt.toISOString(),
        webhook_url: CRM_WEBHOOK_URL
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create linked form' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Construct the link URL
    const baseUrl = req.headers.get('origin') || 'https://gomutui.com'
    const link = `${baseUrl}/simulazione/${body.form_slug}/introduzione/intro_welcome?token=${token}`

    const response: CreateLinkResponse = {
      link,
      token,
      expires_at: expiresAt.toISOString()
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
