
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phoneNumber, campaignName, parameters } = await req.json();
    
    console.log('Richiesta ricevuta:', { phoneNumber, campaignName, parameters });

    // Validate required fields
    if (!phoneNumber || !campaignName) {
      return new Response(
        JSON.stringify({ error: 'phoneNumber e campaignName sono obbligatori' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const AISENSY_API_KEY = Deno.env.get('AISENSY_API_KEY');
    if (!AISENSY_API_KEY) {
      console.error('AISENSY_API_KEY non configurata');
      return new Response(
        JSON.stringify({ error: 'Configurazione API mancante' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare the request body for AiSensy
    const requestBody: any = {
      apiKey: AISENSY_API_KEY,
      campaignName: campaignName,
      destination: phoneNumber,
    };

    // Add parameters if provided
    if (parameters && Object.keys(parameters).length > 0) {
      requestBody.templateParams = [
        parameters.parameter1 || '',
        parameters.parameter2 || '',
        parameters.parameter3 || '',
        parameters.parameter4 || '',
        parameters.parameter5 || '',
        parameters.parameter6 || '',
        parameters.parameter7 || '',
        parameters.parameter8 || '',
        parameters.parameter9 || '',
        parameters.parameter10 || ''
      ];
    }

    console.log('Invio richiesta ad AiSensy:', JSON.stringify(requestBody, null, 2));

    // Send request to AiSensy
    const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.text();
    console.log('Risposta AiSensy:', responseData);

    if (!response.ok) {
      console.error('Errore AiSensy:', response.status, responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Errore invio messaggio', 
          details: responseData,
          status: response.status 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Try to parse response as JSON, fallback to text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseData);
    } catch {
      parsedResponse = { message: responseData };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedResponse,
        campaign: campaignName,
        destination: phoneNumber
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Errore nella funzione:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Errore interno del server', 
        details: error.message || 'Errore sconosciuto' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
