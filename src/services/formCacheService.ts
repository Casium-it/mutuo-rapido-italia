import { supabase } from "@/integrations/supabase/client";
import { Block } from "@/types/form";
import { FormCache, CacheMetrics } from "@/types/cache";

class FormCacheService {
  private static CACHE_PREFIX = 'form-cache-';
  private static CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static REFRESH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
  private static MAX_RETRY_ATTEMPTS = 3;
  private static RETRY_DELAY = 1000; // 1 second

  // Load all active forms from database and cache them with retry logic
  async loadAndCacheAllForms(): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= FormCacheService.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`🔄 Loading forms from database (attempt ${attempt}/${FormCacheService.MAX_RETRY_ATTEMPTS})...`);
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
          console.error(`❌ Database error loading forms (attempt ${attempt}):`, error);
          throw error;
        }

        if (!forms || forms.length === 0) {
          console.warn('⚠️ No active forms found in database');
          return;
        }

        // Process and cache each form
        for (const formData of forms) {
          const blocks = this.transformDbBlocksToBlocks(formData.form_blocks || []);
          
          // Validate blocks before caching
          if (blocks.length === 0) {
            console.warn(`⚠️ Form ${formData.slug} has no blocks, skipping cache`);
            continue;
          }
          
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
        return; // Success, exit retry loop
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < FormCacheService.MAX_RETRY_ATTEMPTS) {
          console.log(`⏳ Waiting ${FormCacheService.RETRY_DELAY}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, FormCacheService.RETRY_DELAY));
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw new Error(`Failed to load forms after ${FormCacheService.MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`);
  }

  // Get form from cache or database with enhanced error handling
  async getForm(slug: string): Promise<FormCache | null> {
    try {
      // Try cache first
      const cachedForm = this.getFromCache(slug);
      
      if (cachedForm && this.isCacheValid(cachedForm)) {
        // Validate cached form structure
        if (this.validateCachedForm(cachedForm)) {
          this.updateCacheHits(slug, cachedForm);
          console.log(`📦 Using valid cached form: ${slug} (${cachedForm.blocks.length} blocks)`);
          return cachedForm;
        } else {
          console.warn(`⚠️ Cached form ${slug} is invalid, clearing cache`);
          this.clearCache(slug);
        }
      }

      // Load from database if cache miss/invalid with retry logic
      return await this.loadFormFromDatabase(slug);
      
    } catch (error) {
      console.error(`❌ Error getting form ${slug}:`, error);
      return null;
    }
  }

  // Load specific form from database with retry logic
  private async loadFormFromDatabase(slug: string): Promise<FormCache | null> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= FormCacheService.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`🔄 Loading form from database: ${slug} (attempt ${attempt}/${FormCacheService.MAX_RETRY_ATTEMPTS})`);
        
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
          if (attempt === FormCacheService.MAX_RETRY_ATTEMPTS) {
            console.warn(`⚠️ Form not found in database after all retries: ${slug}`);
          }
          throw new Error(`Form ${slug} not found or inactive`);
        }

        const blocks = this.transformDbBlocksToBlocks(formData.form_blocks || []);
        
        if (blocks.length === 0) {
          throw new Error(`Form ${slug} has no valid blocks`);
        }
        
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
        console.log(`✅ Loaded and cached form: ${slug} (${blocks.length} blocks)`);
        return cache;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < FormCacheService.MAX_RETRY_ATTEMPTS) {
          console.log(`⏳ Retrying in ${FormCacheService.RETRY_DELAY}ms...`);
          await new Promise(resolve => setTimeout(resolve, FormCacheService.RETRY_DELAY));
        }
      }
    }
    
    console.error(`❌ Failed to load form ${slug} after all retries:`, lastError?.message);
    return null;
  }

  // Validate cached form structure
  private validateCachedForm(cache: FormCache): boolean {
    try {
      if (!cache.data || !cache.blocks || !Array.isArray(cache.blocks)) {
        return false;
      }
      
      if (cache.blocks.length === 0) {
        return false;
      }
      
      // Check if blocks have required properties
      for (const block of cache.blocks) {
        if (!block.block_id || !block.title || !Array.isArray(block.questions)) {
          console.warn(`⚠️ Invalid block structure found:`, block);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error validating cached form:', error);
      return false;
    }
  }

  // Transform database blocks to Block[] format with validation
  private transformDbBlocksToBlocks(dbBlocks: any[]): Block[] {
    try {
      return dbBlocks
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(dbBlock => {
          const blockData = dbBlock.block_data;
          
          if (!blockData || !blockData.block_id) {
            console.warn('⚠️ Skipping invalid block data:', dbBlock);
            return null;
          }
          
          // Ensure the block has all required properties
          return {
            block_number: blockData.block_number || "1",
            block_id: blockData.block_id,
            title: blockData.title || "Untitled Block",
            priority: blockData.priority || 100,
            default_active: blockData.default_active || false,
            invisible: blockData.invisible || false,
            multiBlock: blockData.multiBlock || false,
            blueprint_id: blockData.blueprint_id,
            copy_number: blockData.copy_number,
            questions: Array.isArray(blockData.questions) ? blockData.questions : [],
          };
        })
        .filter(Boolean) as Block[];
    } catch (error) {
      console.error('❌ Error transforming database blocks:', error);
      return [];
    }
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
