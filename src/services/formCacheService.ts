
import { FormSnapshot, formSnapshotService } from './formSnapshotService';

export interface CacheEntry {
  data: FormSnapshot;
  timestamp: number;
  version: number;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  cacheSize: string;
  lastUpdated: number;
}

class FormCacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private readonly MEMORY_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly PERSISTENT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly STORAGE_KEY_PREFIX = 'form-cache-';
  private readonly STATS_KEY = 'form-cache-stats';
  private readonly VERSION_KEY = 'form-cache-version';
  private readonly CURRENT_VERSION = 1;

  /**
   * Get form snapshot with multi-level caching
   */
  async getFormSnapshot(slug: string): Promise<FormSnapshot | null> {
    console.log(`FormCacheService: Getting form snapshot for ${slug}`);

    // 1. Check memory cache first (fastest)
    const memoryCached = this.getFromMemoryCache(slug);
    if (memoryCached) {
      console.log(`FormCacheService: Memory cache hit for ${slug}`);
      this.incrementHitCount(slug);
      return memoryCached;
    }

    // 2. Check persistent cache (localStorage)
    const persistentCached = this.getFromPersistentCache(slug);
    if (persistentCached) {
      console.log(`FormCacheService: Persistent cache hit for ${slug}`);
      // Store in memory cache for faster future access
      this.setMemoryCache(slug, persistentCached);
      this.incrementHitCount(slug);
      return persistentCached;
    }

    // 3. Fetch from service and cache
    console.log(`FormCacheService: Cache miss for ${slug}, fetching from service`);
    const snapshot = await formSnapshotService.loadFormSnapshot(slug);
    
    if (snapshot) {
      this.setCaches(slug, snapshot);
      console.log(`FormCacheService: Cached form snapshot for ${slug}`);
    }

    return snapshot;
  }

  /**
   * Preload common forms at application start
   */
  async preloadCommonForms(formSlugs: string[] = []): Promise<void> {
    console.log('FormCacheService: Starting preload of common forms', formSlugs);
    
    // Default common forms if none specified
    if (formSlugs.length === 0) {
      formSlugs = await this.getCommonFormSlugs();
    }

    const preloadPromises = formSlugs.map(async (slug) => {
      try {
        const cached = this.getFromMemoryCache(slug) || this.getFromPersistentCache(slug);
        if (!cached) {
          console.log(`FormCacheService: Preloading ${slug}`);
          await this.getFormSnapshot(slug);
        } else {
          console.log(`FormCacheService: ${slug} already cached, skipping preload`);
        }
      } catch (error) {
        console.warn(`FormCacheService: Failed to preload ${slug}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
    console.log('FormCacheService: Preload completed');
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    console.log('FormCacheService: Clearing all caches');
    
    // Clear memory cache
    this.memoryCache.clear();
    
    // Clear persistent cache
    this.clearPersistentCache();
    
    // Reset stats
    this.resetStats();
    
    console.log('FormCacheService: All caches cleared');
  }

  /**
   * Clear cache for specific form
   */
  clearFormCache(slug: string): void {
    console.log(`FormCacheService: Clearing cache for ${slug}`);
    
    this.memoryCache.delete(slug);
    localStorage.removeItem(this.getStorageKey(slug));
    
    console.log(`FormCacheService: Cache cleared for ${slug}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    let totalHits = 0;
    let cacheSize = 0;

    // Calculate memory cache stats
    for (const entry of this.memoryCache.values()) {
      totalHits += entry.hits;
      cacheSize += JSON.stringify(entry.data).length;
    }

    // Add persistent cache size estimation
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_KEY_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          cacheSize += value.length;
        }
      }
    }

    return {
      totalEntries: this.memoryCache.size,
      totalHits,
      cacheSize: this.formatBytes(cacheSize),
      lastUpdated: Date.now()
    };
  }

  /**
   * Warm cache by pre-fetching popular forms
   */
  async warmCache(): Promise<void> {
    console.log('FormCacheService: Starting cache warming');
    
    const commonForms = await this.getCommonFormSlugs();
    await this.preloadCommonForms(commonForms);
    
    console.log('FormCacheService: Cache warming completed');
  }

  /**
   * Check if cache needs refresh based on version
   */
  private shouldRefreshCache(): boolean {
    const storedVersion = localStorage.getItem(this.VERSION_KEY);
    return !storedVersion || parseInt(storedVersion) < this.CURRENT_VERSION;
  }

  /**
   * Get from memory cache
   */
  private getFromMemoryCache(slug: string): FormSnapshot | null {
    const entry = this.memoryCache.get(slug);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.MEMORY_CACHE_DURATION;
    if (isExpired) {
      this.memoryCache.delete(slug);
      return null;
    }

    return entry.data;
  }

  /**
   * Get from persistent cache (localStorage)
   */
  private getFromPersistentCache(slug: string): FormSnapshot | null {
    try {
      const stored = localStorage.getItem(this.getStorageKey(slug));
      if (!stored) return null;

      const entry: CacheEntry = JSON.parse(stored);
      const isExpired = Date.now() - entry.timestamp > this.PERSISTENT_CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(this.getStorageKey(slug));
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn(`FormCacheService: Error reading persistent cache for ${slug}:`, error);
      return null;
    }
  }

  /**
   * Set memory cache
   */
  private setMemoryCache(slug: string, snapshot: FormSnapshot): void {
    const entry: CacheEntry = {
      data: snapshot,
      timestamp: Date.now(),
      version: this.CURRENT_VERSION,
      hits: 0
    };
    this.memoryCache.set(slug, entry);
  }

  /**
   * Set persistent cache
   */
  private setPersistentCache(slug: string, snapshot: FormSnapshot): void {
    try {
      const entry: CacheEntry = {
        data: snapshot,
        timestamp: Date.now(),
        version: this.CURRENT_VERSION,
        hits: 0
      };
      localStorage.setItem(this.getStorageKey(slug), JSON.stringify(entry));
    } catch (error) {
      console.warn(`FormCacheService: Error setting persistent cache for ${slug}:`, error);
    }
  }

  /**
   * Set both memory and persistent caches
   */
  private setCaches(slug: string, snapshot: FormSnapshot): void {
    this.setMemoryCache(slug, snapshot);
    this.setPersistentCache(slug, snapshot);
  }

  /**
   * Clear persistent cache
   */
  private clearPersistentCache(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(this.VERSION_KEY);
  }

  /**
   * Get storage key for form
   */
  private getStorageKey(slug: string): string {
    return `${this.STORAGE_KEY_PREFIX}${slug}`;
  }

  /**
   * Get common form slugs (could be configured or based on usage stats)
   */
  private async getCommonFormSlugs(): Promise<string[]> {
    // For now, return a default set. In the future, this could be:
    // - Configured in admin panel
    // - Based on usage analytics
    // - Fetched from a configuration endpoint
    return ['simulazione-mutui', 'richiesta-consulenza', 'valutazione-casa'];
  }

  /**
   * Increment hit count for cache entry
   */
  private incrementHitCount(slug: string): void {
    const memoryEntry = this.memoryCache.get(slug);
    if (memoryEntry) {
      memoryEntry.hits++;
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Reset cache statistics
   */
  private resetStats(): void {
    localStorage.removeItem(this.STATS_KEY);
  }
}

// Export singleton instance
export const formCacheService = new FormCacheService();
