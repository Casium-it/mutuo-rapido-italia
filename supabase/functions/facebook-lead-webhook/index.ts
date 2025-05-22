
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";

// Configura il client Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configura le chiavi per i servizi di messaggistica
const messagingService = Deno.env.get("MESSAGING_SERVICE") || "twilio"; // 'twilio' o 'messagebird'
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
const messageBirdApiKey = Deno.env.get("MESSAGEBIRD_API_KEY");
const messageBirdPhoneNumber = Deno.env.get("MESSAGEBIRD_PHONE_NUMBER");

// URL base dell'applicazione
const appBaseUrl = Deno.env.get("APP_BASE_URL") || "https://app.gomutuo.it";

// Configura CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Funzione per generare uno slug unico
function generateUniqueSlug(): string {
  return nanoid(10); // Genera un ID alfanumerico di 10 caratteri
}

// Funzione per inviare un messaggio SMS via Twilio
async function sendTwilioSMS(phoneNumber: string, message: string) {
  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    throw new Error("Twilio configuration missing");
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
  const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${auth}`,
    },
    body: new URLSearchParams({
      To: phoneNumber,
      From: twilioPhoneNumber,
      Body: message,
    }),
  });

  return await response.json();
}

// Funzione per inviare un messaggio SMS via MessageBird
async function sendMessageBirdSMS(phoneNumber: string, message: string) {
  if (!messageBirdApiKey || !messageBirdPhoneNumber) {
    throw new Error("MessageBird configuration missing");
  }

  const url = "https://rest.messagebird.com/messages";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `AccessKey ${messageBirdApiKey}`,
    },
    body: JSON.stringify({
      originator: messageBirdPhoneNumber,
      recipients: [phoneNumber],
      body: message,
    }),
  });

  return await response.json();
}

// Funzione per inviare il messaggio usando il servizio selezionato
async function sendMessage(phoneNumber: string, message: string) {
  try {
    if (messagingService === "twilio") {
      return await sendTwilioSMS(phoneNumber, message);
    } else if (messagingService === "messagebird") {
      return await sendMessageBirdSMS(phoneNumber, message);
    } else {
      throw new Error(`Unsupported messaging service: ${messagingService}`);
    }
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}

serve(async (req) => {
  // Gestisce richieste preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verifica il metodo HTTP
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Estrae i dati del lead dalla richiesta
    const leadData = await req.json();
    
    // Recupera le informazioni di base del lead
    const name = leadData.name || leadData.full_name || "Utente";
    const phoneNumber = leadData.phone || leadData.phone_number;
    
    // Verifica se è stato fornito un numero di telefono
    if (!phoneNumber) {
      return new Response(JSON.stringify({ error: "Phone number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Formatta il numero di telefono (assicurandosi che inizi con +39 per l'Italia)
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith("+")) {
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+39" + formattedPhone.substring(1);
      } else {
        formattedPhone = "+39" + formattedPhone;
      }
    }
    
    // Genera uno slug unico per questo lead
    const slug = generateUniqueSlug();
    
    // Salva il lead nel database
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        name,
        phone: formattedPhone,
        slug,
      })
      .select()
      .single();
    
    if (leadError) {
      console.error("Failed to save lead:", leadError);
      return new Response(JSON.stringify({ error: "Failed to save lead" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Costruisci il link personalizzato
    const personalisedLink = `${appBaseUrl}/simulazione-avanzata/${slug}`;
    
    // Componi il messaggio da inviare
    const message = `Ciao ${name}! Grazie per il tuo interesse in GoMutuo. Completa la tua simulazione per un mutuo su misura qui: ${personalisedLink}`;
    
    // Invia il messaggio
    try {
      const messagingResult = await sendMessage(formattedPhone, message);
      
      return new Response(
        JSON.stringify({
          success: true,
          lead,
          slug,
          personalisedLink,
          messagingResult,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (messagingError) {
      // In caso di errore nell'invio del messaggio, restituiamo comunque l'ID del lead
      // poiché il lead è stato salvato correttamente nel database
      console.error("Failed to send message:", messagingError);
      return new Response(
        JSON.stringify({
          success: true,
          lead,
          slug,
          personalisedLink,
          messagingError: messagingError.message,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
