
import { supabase } from "@/integrations/supabase/client";
import { Block } from "@/types/form";

export interface FormSnapshot {
  id: string;
  slug: string;
  title: string;
  description?: string;
  form_type: string;
  blocks: Block[];
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseForm {
  id: string;
  slug: string;
  title: string;
  description?: string;
  form_type: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFormBlock {
  id: string;
  form_id: string;
  block_data: Block;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

class FormSnapshotService {
  private cache = new Map<string, FormSnapshot>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Load a form snapshot by slug with caching
   */
  async loadFormSnapshot(slug: string): Promise<FormSnapshot | null> {
    console.log(`FormSnapshotService: Loading form snapshot for slug: ${slug}`);

    // Check cache first
    const cached = this.getFromCache(slug);
    if (cached) {
      console.log(`FormSnapshotService: Using cached snapshot for ${slug}`);
      return cached;
    }

    try {
      // Fetch form metadata
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (formError || !formData) {
        console.log(`FormSnapshotService: Form not found in database: ${slug}`, formError);
        return null;
      }

      // Fetch form blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('form_blocks')
        .select('*')
        .eq('form_id', formData.id)
        .order('sort_order', { ascending: true });

      if (blocksError) {
        console.error(`FormSnapshotService: Error loading blocks for form ${slug}:`, blocksError);
        return null;
      }

      // Transform database data to form snapshot
      const snapshot: FormSnapshot = {
        id: formData.id,
        slug: formData.slug,
        title: formData.title,
        description: formData.description,
        form_type: formData.form_type,
        blocks: (blocksData || []).map((block: DatabaseFormBlock) => block.block_data),
        version: formData.version,
        created_at: formData.created_at,
        updated_at: formData.updated_at
      };

      // Cache the snapshot
      this.setCache(slug, snapshot);
      
      console.log(`FormSnapshotService: Successfully loaded form snapshot for ${slug}`, {
        blocksCount: snapshot.blocks.length,
        version: snapshot.version
      });

      return snapshot;
      
    } catch (error) {
      console.error(`FormSnapshotService: Unexpected error loading form ${slug}:`, error);
      return null;
    }
  }

  /**
   * Check if a form exists in the database
   */
  async formExists(slug: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('id')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error(`FormSnapshotService: Error checking if form exists: ${slug}`, error);
      return false;
    }
  }

  /**
   * Get all available forms
   */
  async getAllForms(): Promise<DatabaseForm[]> {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('FormSnapshotService: Error fetching all forms:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('FormSnapshotService: Unexpected error fetching all forms:', error);
      return [];
    }
  }

  /**
   * Clear cache for a specific form or all forms
   */
  clearCache(slug?: string): void {
    if (slug) {
      this.cache.delete(slug);
      this.cacheExpiry.delete(slug);
      console.log(`FormSnapshotService: Cleared cache for ${slug}`);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
      console.log('FormSnapshotService: Cleared all cache');
    }
  }

  private getFromCache(slug: string): FormSnapshot | null {
    const expiry = this.cacheExpiry.get(slug);
    if (!expiry || Date.now() > expiry) {
      // Cache expired
      this.cache.delete(slug);
      this.cacheExpiry.delete(slug);
      return null;
    }
    return this.cache.get(slug) || null;
  }

  private setCache(slug: string, snapshot: FormSnapshot): void {
    this.cache.set(slug, snapshot);
    this.cacheExpiry.set(slug, Date.now() + this.CACHE_DURATION);
  }
}

// Export singleton instance
export const formSnapshotService = new FormSnapshotService();
