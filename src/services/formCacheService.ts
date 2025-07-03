
import { supabase } from "@/integrations/supabase/client";
import { Block } from "@/types/form";
import { FormCache, CacheMetrics } from "@/types/cache";
import { allBlocks } from "@/data/blocks";

class FormCacheService {
  private static CACHE_PREFIX = 'form-cache-';
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

  // Load all active forms from database and cache them
  async loadAndCacheAllForms(): Promise<void> {
    try {
      console.log('🔄 Loading forms from database...');
      const startTime = Date.now();
      
      const { data: forms, error } = await supabase
        .from('forms')
        .select(`
          *,
          form_blocks (
            id,
            sort_order,
            block_data
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Database error loading forms:', error);
        throw error;
      }

      if (!forms || forms.length === 0) {
        console.warn('⚠️ No active forms found in database');
        return;
      }

      // Process and cache each form
      for (const formData of forms) {
        const blocks = this.transformDbBlocksToBlocks(formData.form_blocks || []);
        
        const cache: FormCache = {
          data: {
            id: formData.id,
            slug: formData.slug,
            title: formData.title,
            form_type: formData.form_type,
            description: formData.description,
            version: formData.version,
            is_active: formData.is_active,
            created_at: formData.created_at,
            updated_at: formData.updated_at,
          },
          blocks,
          timestamp: Date.now(),
          hits: 0,
          version: formData.version,
        };

        this.storeInCache(formData.slug, cache);
        console.log(`✅ Cached form: ${formData.slug} (${blocks.length} blocks)`);
      }

      const loadTime = Date.now() - startTime;
      console.log(`🎉 Successfully loaded and cached ${forms.length} forms in ${loadTime}ms`);
    } catch (error) {
      console.error('❌ Failed to load forms from database:', error);
      throw error;
    }
  }

  // Get form from cache or database
  async getForm(slug: string): Promise<FormCache | null> {
    try {
      // Try cache first
      const cachedForm = this.getFromCache(slug);
      
      if (cachedForm && this.isCacheValid(cachedForm)) {
        this.updateCacheHits(slug, cachedForm);
        console.log(`📦 Using cached form: ${slug}`);
        return cachedForm;
      }

      // Load from database if cache miss/invalid
      console.log(`🔄 Loading form from database: ${slug}`);
      const { data: formData, error } = await supabase
        .from('forms')
        .select(`
          *,
          form_blocks (
            id,
            sort_order,
            block_data
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error || !formData) {
        console.warn(`⚠️ Form not found in database: ${slug}`);
        return null;
      }

      const blocks = this.transformDbBlocksToBlocks(formData.form_blocks || []);
      
      const cache: FormCache = {
        data: {
          id: formData.id,
          slug: formData.slug,
          title: formData.title,
          form_type: formData.form_type,
          description: formData.description,
          version: formData.version,
          is_active: formData.is_active,
          created_at: formData.created_at,
          updated_at: formData.updated_at,
        },
        blocks,
        timestamp: Date.now(),
        hits: 1,
        version: formData.version,
      };

      this.storeInCache(slug, cache);
      console.log(`✅ Loaded and cached form: ${slug}`);
      return cache;
    } catch (error) {
      console.error(`❌ Error loading form ${slug}:`, error);
      return null;
    }
  }

  // Transform database blocks to Block[] format
  private transformDbBlocksToBlocks(dbBlocks: any[]): Block[] {
    return dbBlocks
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(dbBlock => {
        const blockData = dbBlock.block_data;
        
        // Ensure the block has all required properties
        return {
          block_number: blockData.block_number || "1",
          block_id: blockData.block_id,
          title: blockData.title,
          priority: blockData.priority || 100,
          default_active: blockData.default_active || false,
          invisible: blockData.invisible || false,
          multiBlock: blockData.multiBlock || false,
          blueprint_id: blockData.blueprint_id,
          copy_number: blockData.copy_number,
          questions: blockData.questions || [],
        };
      });
  }

  // Check if cache is valid
  private isCacheValid(cache: FormCache): boolean {
    const age = Date.now() - cache.timestamp;
    return age < FormCacheService.CACHE_DURATION;
  }

  // Store form in localStorage
  private storeInCache(slug: string, formData: FormCache): void {
    try {
      const key = FormCacheService.CACHE_PREFIX + slug;
      localStorage.setItem(key, JSON.stringify(formData));
    } catch (error) {
      console.error(`❌ Failed to store form in cache: ${slug}`, error);
    }
  }

  // Get form from localStorage
  private getFromCache(slug: string): FormCache | null {
    try {
      const key = FormCacheService.CACHE_PREFIX + slug;
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error(`❌ Failed to get form from cache: ${slug}`, error);
      return null;
    }
  }

  // Update cache hit counter
  private updateCacheHits(slug: string, cache: FormCache): void {
    try {
      cache.hits += 1;
      this.storeInCache(slug, cache);
    } catch (error) {
      console.error(`❌ Failed to update cache hits: ${slug}`, error);
    }
  }

  // Clear specific cache or all caches
  clearCache(slug?: string): void {
    try {
      if (slug) {
        const key = FormCacheService.CACHE_PREFIX + slug;
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared cache for: ${slug}`);
      } else {
        // Clear all form caches
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(FormCacheService.CACHE_PREFIX)
        );
        keys.forEach(key => localStorage.removeItem(key));
        console.log(`🗑️ Cleared all form caches (${keys.length} items)`);
      }
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }

  // Clear expired caches
  clearExpiredCaches(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(FormCacheService.CACHE_PREFIX)
      );
      
      let clearedCount = 0;
      keys.forEach(key => {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '{}');
          if (!this.isCacheValid(cached)) {
            localStorage.removeItem(key);
            clearedCount++;
          }
        } catch (error) {
          // Remove corrupted cache entries
          localStorage.removeItem(key);
          clearedCount++;
        }
      });

      if (clearedCount > 0) {
        console.log(`🧹 Cleared ${clearedCount} expired cache entries`);
      }
    } catch (error) {
      console.error('❌ Failed to clear expired caches:', error);
    }
  }

  // Get all cached forms info
  getCacheStats(): { [slug: string]: CacheMetrics } {
    const stats: { [slug: string]: CacheMetrics } = {};
    
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(FormCacheService.CACHE_PREFIX)
      );
      
      keys.forEach(key => {
        try {
          const slug = key.replace(FormCacheService.CACHE_PREFIX, '');
          const cached = JSON.parse(localStorage.getItem(key) || '{}');
          
          stats[slug] = {
            hits: cached.hits || 0,
            misses: 0, // Would need separate tracking
            lastAccessed: cached.timestamp || 0,
            loadTime: 0, // Would need separate tracking
          };
        } catch (error) {
          console.error(`❌ Failed to get stats for ${key}:`, error);
        }
      });
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
    }
    
    return stats;
  }

  // Get fallback blocks (static blocks)
  getFallbackBlocks(): Block[] {
    console.log('🔄 Using fallback static blocks');
    return allBlocks;
  }
}

// Export singleton instance
export const formCacheService = new FormCacheService();

// Development tools
if (typeof window !== 'undefined') {
  (window as any).formCache = {
    list: () => formCacheService.getCacheStats(),
    clear: (slug?: string) => formCacheService.clearCache(slug),
    stats: () => formCacheService.getCacheStats(),
    loadAll: () => formCacheService.loadAndCacheAllForms(),
  };
}
