
import { supabase } from "@/integrations/supabase/client";
import { WebhookService } from "./webhookService";

export interface LinkedFormData {
  token: string;
  form_slug: string;
  expires_at: string;
  is_used: boolean;
  webhook_url: string;
}

export interface LinkedFormValidationResult {
  valid: boolean;
  linkedForm?: LinkedFormData;
  error?: string;
}

/**
 * Service per gestire i form linkati dal CRM
 */
export class LinkedFormService {
  /**
   * Valida un token di form linkato
   */
  static async validateToken(token: string): Promise<LinkedFormValidationResult> {
    try {
      console.log(`[LinkedForm] Validating token: ${token}`);

      if (!token || typeof token !== 'string') {
        return { valid: false, error: 'Token non valido' };
      }

      // Cerca il linked form valido
      const { data: linkedForm, error } = await supabase
        .from('linked_forms')
        .select('*')
        .eq('token', token)
        .single();

      if (error) {
        console.error('[LinkedForm] Database error:', error);
        return { valid: false, error: 'Token non trovato' };
      }

      // Verifica scadenza
      const now = new Date();
      const expiresAt = new Date(linkedForm.expires_at);
      
      if (now > expiresAt) {
        console.log('[LinkedForm] Token expired');
        return { valid: false, error: 'Token scaduto' };
      }

      console.log(`[LinkedForm] ✅ Token valid, used: ${linkedForm.is_used}`);
      return { 
        valid: true, 
        linkedForm: linkedForm as LinkedFormData
      };

    } catch (error) {
      console.error('[LinkedForm] Validation error:', error);
      return { valid: false, error: 'Errore di validazione' };
    }
  }

  /**
   * Marca un token come utilizzato e invia il webhook form_started
   */
  static async markTokenAsUsed(token: string): Promise<boolean> {
    try {
      console.log(`[LinkedForm] Marking token as used: ${token}`);

      // Aggiorna il flag is_used
      const { error: updateError } = await supabase
        .from('linked_forms')
        .update({ is_used: true })
        .eq('token', token)
        .eq('is_used', false); // Solo se non è già stato usato

      if (updateError) {
        console.error('[LinkedForm] Update error:', updateError);
        return false;
      }

      // Invia webhook form_started
      const webhookSent = await WebhookService.sendWebhook(token, 'form_started');
      
      if (!webhookSent) {
        console.warn('[LinkedForm] Failed to send form_started webhook');
      }

      return true;

    } catch (error) {
      console.error('[LinkedForm] Error marking token as used:', error);
      return false;
    }
  }

  /**
   * Invia webhook form_completed con tutti i dati del form
   */
  static async sendFormCompletedWebhook(
    token: string, 
    formResponses: any
  ): Promise<boolean> {
    try {
      console.log(`[LinkedForm] Sending form completed webhook for token: ${token}`);

      return await WebhookService.sendWebhook(token, 'form_completed', {
        form_responses: formResponses
      });

    } catch (error) {
      console.error('[LinkedForm] Error sending form completed webhook:', error);
      return false;
    }
  }

  /**
   * Invia webhook form_saved (per future implementazioni)
   */
  static async sendFormSavedWebhook(
    token: string,
    completionPercentage: number,
    lastQuestion: string
  ): Promise<boolean> {
    try {
      console.log(`[LinkedForm] Sending form saved webhook for token: ${token}`);

      return await WebhookService.sendWebhook(token, 'form_saved', {
        completion_percentage: completionPercentage,
        last_question: lastQuestion
      });

    } catch (error) {
      console.error('[LinkedForm] Error sending form saved webhook:', error);
      return false;
    }
  }
}
