
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FacebookConversionEvent {
  event_name: string
  event_time: number
  event_source_url: string
  action_source: string
  user_data?: {
    ph?: string[]
    client_user_agent?: string
  }
  custom_data?: {
    [key: string]: any
  }
}

interface ConversionRequest {
  eventName: string
  eventSourceUrl: string
  userAgent?: string
  phoneNumber?: string
  customData?: { [key: string]: any }
}

// Hash function for phone numbers (SHA-256)
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input.toLowerCase().trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const { eventName, eventSourceUrl, userAgent, phoneNumber, customData }: ConversionRequest = await req.json()

    console.log('Facebook Conversion API request:', { eventName, eventSourceUrl })

    // Get environment variables
    const pixelId = Deno.env.get('FACEBOOK_PIXEL_ID')
    const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN')
    const apiVersion = 'v18.0'

    if (!pixelId || !accessToken) {
      console.error('Missing Facebook API credentials')
      return new Response('Missing API credentials', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    // Build event data
    const eventData: FacebookConversionEvent = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl,
      action_source: 'website'
    }

    // Add user data if available
    if (userAgent || phoneNumber) {
      eventData.user_data = {}
      
      if (userAgent) {
        eventData.user_data.client_user_agent = userAgent
      }
      
      if (phoneNumber) {
        // Hash the phone number
        const hashedPhone = await hashString(phoneNumber.replace(/\s+/g, '').replace(/^\+/, ''))
        eventData.user_data.ph = [hashedPhone]
      }
    }

    // Add custom data if provided
    if (customData) {
      eventData.custom_data = customData
    }

    // Prepare the payload
    const payload = {
      data: [eventData]
    }

    // Send to Facebook Conversion API
    const facebookUrl = `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${accessToken}`
    
    console.log('Sending to Facebook Conversion API:', JSON.stringify(payload, null, 2))

    const response = await fetch(facebookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('Facebook API error:', result)
      return new Response('Facebook API error', { 
        status: response.status, 
        headers: corsHeaders 
      })
    }

    console.log('Facebook Conversion API success:', result)

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Facebook Conversion API error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
