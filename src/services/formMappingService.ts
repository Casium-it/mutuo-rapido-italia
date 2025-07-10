
import { supabase } from "@/integrations/supabase/client";

export interface FormInfo {
  id: string;
  slug: string;
  title: string;
  form_type: string;
  completion_behavior: string;
}

/**
 * Ottiene le informazioni del form dal database usando lo slug
 * @param formSlug - Lo slug del form da cercare
 * @returns Le informazioni del form o null se non trovato
 */
export async function getFormInfoBySlug(formSlug: string): Promise<FormInfo | null> {
  try {
    console.log(`FormMapping: Getting form info for slug: ${formSlug}`);
    
    const { data, error } = await supabase
      .from('forms')
      .select('id, slug, title, form_type, completion_behavior')
      .eq('slug', formSlug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`FormMapping: Error fetching form info for ${formSlug}:`, error);
      return null;
    }

    if (!data) {
      console.error(`FormMapping: No form found for slug: ${formSlug}`);
      return null;
    }

    console.log(`FormMapping: Found form info for ${formSlug}:`, data);
    return data;
  } catch (error) {
    console.error(`FormMapping: Exception getting form info for ${formSlug}:`, error);
    return null;
  }
}
