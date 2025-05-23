
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";

// Configura il client Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configura le chiavi per WhatsApp Business API
const whatsappAccessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
const whatsappBusinessAccountId = Deno.env.get("WHATSAPP_BUSINESS_ACCOUNT_ID");

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

// Funzione per inviare un messaggio WhatsApp
async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  if (!whatsappAccessToken || !whatsappPhoneNumberId) {
    throw new Error("WhatsApp Business API configuration missing");
  }

  // Rimuove il prefisso + se presente per WhatsApp API
  const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber.substring(1) : phoneNumber;

  const url = `https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`;
  
  const messageData = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "text",
    text: {
      body: message
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${whatsappAccessToken}`,
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("WhatsApp API Error:", errorText);
    throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
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
    
    // Componi il messaggio da inviare via WhatsApp
    const message = `Ciao ${name}! 👋\n\nGrazie per il tuo interesse in GoMutuo.\n\nCompleta la tua simulazione per un mutuo su misura qui:\n${personalisedLink}\n\n🏠 Il tuo percorso verso il mutuo ideale inizia adesso!`;
    
    // Invia il messaggio WhatsApp
    try {
      const whatsappResult = await sendWhatsAppMessage(formattedPhone, message);
      
      console.log("WhatsApp message sent successfully:", whatsappResult);
      
      return new Response(
        JSON.stringify({
          success: true,
          lead,
          slug,
          personalisedLink,
          whatsappResult,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (whatsappError) {
      // In caso di errore nell'invio del messaggio, restituiamo comunque l'ID del lead
      // poiché il lead è stato salvato correttamente nel database
      console.error("Failed to send WhatsApp message:", whatsappError);
      return new Response(
        JSON.stringify({
          success: true,
          lead,
          slug,
          personalisedLink,
          whatsappError: whatsappError.message,
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
