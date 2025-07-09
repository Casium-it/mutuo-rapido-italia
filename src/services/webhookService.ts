
import { supabase } from "@/integrations/supabase/client";

type WebhookEventType = 'form_started' | 'form_saved' | 'form_completed';

interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  token: string;
  completion_percentage?: number;
  last_question?: string;
  form_responses?: any;
}

interface WebhookDeliveryResult {
  success: boolean;
  httpStatus?: number;
  responseBody?: string;
  error?: string;
}

/**
 * Service per l'invio di webhook al CRM
 */
export class WebhookService {
  private static async createHMACSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(payload);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `sha256=${hashHex}`;
  }

  private static async deliverWebhook(
    webhookUrl: string, 
    payload: WebhookPayload, 
    signature: string
  ): Promise<WebhookDeliveryResult> {
    try {
      const payloadString = JSON.stringify(payload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'User-Agent': 'GoMutui-Webhook/1.0'
        },
        body: payloadString
      });

      const responseBody = await response.text();

      return {
        success: response.ok,
        httpStatus: response.status,
        responseBody: responseBody.substring(0, 1000) // Limit response body length
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private static async retryWebhook(
    webhookUrl: string,
    payload: WebhookPayload,
    signature: string,
    maxAttempts: number = 3
  ): Promise<WebhookDeliveryResult> {
    let lastResult: WebhookDeliveryResult | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[Webhook] Attempt ${attempt}/${maxAttempts} for ${payload.event} (token: ${payload.token})`);
      
      lastResult = await this.deliverWebhook(webhookUrl, payload, signature);
      
      if (lastResult.success) {
        console.log(`[Webhook] ✅ Successfully delivered on attempt ${attempt}`);
        return lastResult;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(`[Webhook] ❌ Failed attempt ${attempt}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`[Webhook] ❌ All attempts failed for ${payload.event}`);
    return lastResult!;
  }

  /**
   * Invia un webhook al CRM e registra il tentativo
   */
  static async sendWebhook(
    token: string,
    eventType: WebhookEventType,
    additionalData?: {
      completion_percentage?: number;
      last_question?: string;
      form_responses?: any;
    }
  ): Promise<boolean> {
    try {
      console.log(`[Webhook] Sending ${eventType} webhook for token: ${token}`);

      // Ottieni i dettagli del linked form
      const { data: linkedForm, error: linkedFormError } = await supabase
        .from('linked_forms')
        .select('webhook_url, form_slug')
        .eq('token', token)
        .single();

      if (linkedFormError || !linkedForm) {
        console.error('[Webhook] Linked form not found:', linkedFormError);
        return false;
      }

      // Prepara il payload
      const payload: WebhookPayload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        token: token,
        ...additionalData
      };

      // Ottieni il webhook secret (in un'implementazione reale, questo dovrebbe essere configurabile)
      const webhookSecret = 'webhook_secret_key'; // TODO: Move to environment variable

      // Crea la firma HMAC
      const signature = await this.createHMACSignature(JSON.stringify(payload), webhookSecret);

      // Invia il webhook con retry
      const result = await this.retryWebhook(linkedForm.webhook_url, payload, signature);

      // Registra il tentativo nel database
      const { error: logError } = await supabase
        .from('webhook_logs')
        .insert({
          linked_token: token,
          event_type: eventType,
          payload: payload,
          http_status: result.httpStatus || null,
          response_body: result.responseBody || result.error || null,
          attempt_count: 3, // Max attempts used
          delivered_at: result.success ? new Date().toISOString() : null
        });

      if (logError) {
        console.error('[Webhook] Failed to log webhook attempt:', logError);
      }

      return result.success;

    } catch (error) {
      console.error('[Webhook] Unexpected error:', error);
      
      // Registra l'errore nel database
      try {
        await supabase
          .from('webhook_logs')
          .insert({
            linked_token: token,
            event_type: eventType,
            payload: { event: eventType, timestamp: new Date().toISOString(), token, error: 'Service error' },
            http_status: null,
            response_body: error instanceof Error ? error.message : 'Unknown error',
            attempt_count: 1,
            delivered_at: null
          });
      } catch (logError) {
        console.error('[Webhook] Failed to log error:', logError);
      }

      return false;
    }
  }
}
