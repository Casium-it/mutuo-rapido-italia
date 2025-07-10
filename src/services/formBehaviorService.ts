import { supabase } from "@/integrations/supabase/client";

export interface FormBehaviorConfig {
  completion_behavior: 'form-completed' | 'form-completed-redirect';
  form_type: string;
  title: string;
}

export const formBehaviorService = {
  /**
   * Get form configuration by slug
   */
  async getFormBehavior(formSlug: string): Promise<FormBehaviorConfig | null> {
    try {
      console.log(`🔍 Fetching form behavior for slug: ${formSlug}`);
      
      const { data, error } = await supabase
        .from('forms')
        .select('completion_behavior, form_type, title')
        .eq('slug', formSlug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Error fetching form behavior:', error);
        return null;
      }

      if (!data) {
        console.warn('⚠️ No form found for slug:', formSlug);
        return null;
      }

      console.log('✅ Form behavior retrieved:', data);
      return data as FormBehaviorConfig;
    } catch (error) {
      console.error('❌ Unexpected error in getFormBehavior:', error);
      return null;
    }
  },

  /**
   * Get completion route based on behavior
   */
  getCompletionRoute(behavior: string): string {
    switch (behavior) {
      case 'form-completed-redirect':
        return '/form-completed-redirect';
      case 'form-completed':
      default:
        return '/form-completed';
    }
  }
};