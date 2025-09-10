import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface YCloudWebhookEvent {
  id: string;
  type: string;
  apiVersion: string;
  createTime: string;
  whatsappMessage?: {
    id: string;
    wamid?: string;
    status: string;
    from: string;
    to: string;
    text?: {
      body: string;
    };
    image?: {
      url: string;
      mime_type?: string;
    };
    document?: {
      url: string;
      mime_type?: string;
      filename?: string;
    };
    voice?: {
      url: string;
      mime_type?: string;
    };
    video?: {
      url: string;
      mime_type?: string;
    };
    errorCode?: string;
    errorMessage?: string;
    totalPrice?: number;
    currency?: string;
  };
  whatsappContact?: {
    id: string;
    phone: string;
    profile?: {
      name?: string;
    };
    wa_id?: string;
  };
}

/**
 * Verify YCloud webhook signature using HMAC SHA-256
 * @param body Raw request body
 * @param signature YCloud-Signature header value
 * @param secret Webhook endpoint secret
 * @returns boolean indicating if signature is valid
 */
async function verifyYCloudSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Parse signature header: t=timestamp,s=signature
    const sigParts = signature.split(',');
    let timestamp = '';
    let sig = '';
    
    for (const part of sigParts) {
      const [prefix, value] = part.split('=');
      if (prefix === 't') timestamp = value;
      if (prefix === 's') sig = value;
    }
    
    if (!timestamp || !sig) {
      console.error('Invalid signature format');
      return false;
    }
    
    // Create signed payload: timestamp.body
    const signedPayload = `${timestamp}.${body}`;
    
    // Create HMAC SHA-256 signature
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signedPayload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature_bytes = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedSignature = Array.from(new Uint8Array(signature_bytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Compare signatures
    const isValid = expectedSignature === sig;
    
    // Check timestamp (reject if older than 5 minutes)
    const timestampNumber = parseInt(timestamp);
    const currentTime = Math.floor(Date.now() / 1000);
    const isTimestampValid = (currentTime - timestampNumber) <= 300; // 5 minutes
    
    console.log(`Signature verification: ${isValid ? 'VALID' : 'INVALID'}`);
    console.log(`Timestamp verification: ${isTimestampValid ? 'VALID' : 'INVALID'}`);
    
    return isValid && isTimestampValid;
    
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Process WhatsApp message event
 */
async function processMessageEvent(event: YCloudWebhookEvent) {
  const message = event.whatsappMessage;
  if (!message) return;
  
  console.log(`Processing message event: ${event.type}`, {
    messageId: message.id,
    wamid: message.wamid,
    status: message.status,
    from: message.from,
    to: message.to
  });
  
  // Determine message type and content
  let messageType = 'text';
  let content: any = {};
  let mediaUrl = '';
  let mediaType = '';
  
  if (message.text) {
    messageType = 'text';
    content = { text: message.text.body };
  } else if (message.image) {
    messageType = 'image';
    content = message.image;
    mediaUrl = message.image.url;
    mediaType = message.image.mime_type || 'image/jpeg';
  } else if (message.document) {
    messageType = 'document';
    content = message.document;
    mediaUrl = message.document.url;
    mediaType = message.document.mime_type || 'application/octet-stream';
  } else if (message.voice) {
    messageType = 'voice';
    content = message.voice;
    mediaUrl = message.voice.url;
    mediaType = message.voice.mime_type || 'audio/ogg';
  } else if (message.video) {
    messageType = 'video';
    content = message.video;
    mediaUrl = message.video.url;
    mediaType = message.video.mime_type || 'video/mp4';
  }
  
  // Determine direction (inbound vs outbound)
  const direction = event.type.includes('inbound') ? 'inbound' : 'outbound';
  
  // Insert or update message in database
  const messageData = {
    ycloud_message_id: message.id,
    wamid: message.wamid || null,
    direction,
    status: message.status,
    message_type: messageType,
    from_phone: message.from,
    to_phone: message.to,
    content,
    media_url: mediaUrl || null,
    media_type: mediaType || null,
    error_code: message.errorCode || null,
    error_message: message.errorMessage || null,
    total_price: message.totalPrice || 0,
    currency: message.currency || 'USD',
    webhook_event_id: event.id
  };
  
  // Check if message already exists
  const { data: existingMessage } = await supabase
    .from('whatsapp_messages')
    .select('id')
    .eq('ycloud_message_id', message.id)
    .single();
  
  if (existingMessage) {
    // Update existing message
    const { error } = await supabase
      .from('whatsapp_messages')
      .update(messageData)
      .eq('ycloud_message_id', message.id);
    
    if (error) {
      console.error('Error updating message:', error);
      throw error;
    }
    console.log('Message updated successfully');
  } else {
    // Insert new message
    const { data: newMessage, error } = await supabase
      .from('whatsapp_messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting message:', error);
      throw error;
    }
    console.log('Message inserted successfully');
    
    // Update conversation if this is an inbound message
    if (direction === 'inbound') {
      await updateConversation(message.from, newMessage.id);
    }
  }
}

/**
 * Process WhatsApp contact event
 */
async function processContactEvent(event: YCloudWebhookEvent) {
  const contact = event.whatsappContact;
  if (!contact) return;
  
  console.log(`Processing contact event: ${event.type}`, {
    contactId: contact.id,
    phone: contact.phone,
    profileName: contact.profile?.name
  });
  
  const contactData = {
    phone_number: contact.phone,
    display_name: contact.profile?.name || null,
    profile_name: contact.profile?.name || null,
    webhook_event_id: event.id,
    last_seen_at: new Date().toISOString()
  };
  
  // Insert or update contact
  const { error } = await supabase
    .from('whatsapp_contacts')
    .upsert(contactData, {
      onConflict: 'phone_number',
      ignoreDuplicates: false
    });
  
  if (error) {
    console.error('Error upserting contact:', error);
    throw error;
  }
  
  console.log('Contact processed successfully');
  
  // Create or update conversation
  await updateConversation(contact.phone, null);
}

/**
 * Update or create conversation
 */
async function updateConversation(phoneNumber: string, messageId: string | null) {
  // Get contact ID
  const { data: contact } = await supabase
    .from('whatsapp_contacts')
    .select('id')
    .eq('phone_number', phoneNumber)
    .single();
  
  // Check if conversation exists
  const { data: existingConversation } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single();
  
  if (existingConversation) {
    // Update existing conversation
    const updates: any = {
      last_message_at: new Date().toISOString()
    };
    
    if (messageId) {
      updates.last_message_id = messageId;
      // Increment unread count for inbound messages
      updates.unread_count = (existingConversation.unread_count || 0) + 1;
    }
    
    if (contact) {
      updates.contact_id = contact.id;
    }
    
    const { error } = await supabase
      .from('whatsapp_conversations')
      .update(updates)
      .eq('phone_number', phoneNumber);
    
    if (error) {
      console.error('Error updating conversation:', error);
    }
  } else {
    // Create new conversation
    const conversationData = {
      phone_number: phoneNumber,
      contact_id: contact?.id || null,
      last_message_id: messageId,
      last_message_at: new Date().toISOString(),
      unread_count: messageId ? 1 : 0
    };
    
    const { error } = await supabase
      .from('whatsapp_conversations')
      .insert(conversationData);
    
    if (error) {
      console.error('Error creating conversation:', error);
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  console.log(`YCloud webhook received: ${req.method} ${req.url}`);
  
  try {
    // Verify it's a POST request
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }
    
    // Get raw body and signature
    const rawBody = await req.text();
    const signature = req.headers.get('YCloud-Signature');
    
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Raw body length:', rawBody.length);
    console.log('YCloud-Signature header:', signature ? 'present' : 'missing');
    
    // For now, skip signature verification in development
    // TODO: Enable signature verification in production
    const webhookSecret = Deno.env.get('YCLOUD_WEBHOOK_SECRET');
    
    if (webhookSecret && signature) {
      const isSignatureValid = await verifyYCloudSignature(rawBody, signature, webhookSecret);
      if (!isSignatureValid) {
        console.error('Invalid webhook signature');
        return new Response('Invalid signature', { 
          status: 401,
          headers: corsHeaders
        });
      }
    } else if (webhookSecret) {
      console.warn('Webhook secret configured but no signature provided');
    } else {
      console.warn('No webhook secret configured - skipping signature verification');
    }
    
    // Parse event data
    const event: YCloudWebhookEvent = JSON.parse(rawBody);
    console.log('Parsed webhook event:', {
      id: event.id,
      type: event.type,
      apiVersion: event.apiVersion
    });
    
    // Process different event types
    switch (event.type) {
      case 'whatsapp.message.received':
      case 'whatsapp.message.updated':
      case 'whatsapp.message.sent':
      case 'whatsapp.message.delivered':
      case 'whatsapp.message.read':
      case 'whatsapp.message.failed':
        await processMessageEvent(event);
        break;
        
      case 'whatsapp.contact.created':
      case 'whatsapp.contact.updated':
        await processContactEvent(event);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
        break;
    }
    
    // Return success response quickly
    return new Response(
      JSON.stringify({ 
        success: true,
        eventId: event.id,
        eventType: event.type 
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
});