import { supabase } from "@/integrations/supabase/client";

/**
 * Service to handle mapping between formSlug and form_type
 * Centralizes form metadata retrieval and ensures consistency
 */

export interface FormInfo {
  slug: string;
  form_type: string;
  title: string;
  completion_behavior: string;
}

/**
 * Get form information by slug
 */
export async function getFormInfoBySlug(formSlug: string): Promise<FormInfo | null> {
  try {
    const { data, error } = await supabase
      .from('forms')
      .select('slug, form_type, title, completion_behavior')
      .eq('slug', formSlug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching form info by slug:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching form info by slug:', error);
    return null;
  }
}

/**
 * Get form slug by form_type (for backward compatibility and resume scenarios)
 */
export async function getFormSlugByType(formType: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('forms')
      .select('slug')
      .eq('form_type', formType)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching form slug by type:', error);
      return null;
    }

    return data?.slug || null;
  } catch (error) {
    console.error('Unexpected error fetching form slug by type:', error);
    return null;
  }
}

/**
 * Get all active forms mapping
 */
export async function getAllActiveForms(): Promise<FormInfo[]> {
  try {
    const { data, error } = await supabase
      .from('forms')
      .select('slug, form_type, title, completion_behavior')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching all active forms:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching all active forms:', error);
    return [];
  }
}