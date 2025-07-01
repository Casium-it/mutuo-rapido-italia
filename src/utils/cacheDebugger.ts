
import { formCacheService } from '@/services/formCacheService';
import { preloadService } from '@/services/preloadService';
import { formDefinitionService } from '@/services/formDefinitionService';

/**
 * Cache debugging utilities for browser console
 */
class CacheDebugger {
  /**
   * Get comprehensive cache information
   */
  getInfo() {
    const stats = formCacheService.getCacheStats();
    const preloadStatus = preloadService.getStatus();
    
    console.group('🔍 Form Cache Debug Info');
    console.log('📊 Cache Statistics:', stats);
    console.log('⚡ Preload Status:', preloadStatus);
    console.log('🗂️ Local Storage Keys:', this.getLocalStorageKeys());
    console.groupEnd();
    
    return {
      stats,
      preloadStatus,
      localStorageKeys: this.getLocalStorageKeys()
    };
  }

  /**
   * Clear all caches
   */
  clearAll() {
    console.log('🧹 Clearing all form caches...');
    formCacheService.clearAllCaches();
    console.log('✅ All caches cleared');
  }

  /**
   * Clear specific form cache
   */
  clearForm(formSlug: string) {
    console.log(`🧹 Clearing cache for form: ${formSlug}`);
    formCacheService.clearFormCache(formSlug);
    console.log(`✅ Cache cleared for ${formSlug}`);
  }

  /**
   * Force refresh all caches
   */
  async refreshAll() {
    console.log('🔄 Refreshing all form caches...');
    try {
      await preloadService.refreshAllCaches();
      console.log('✅ All caches refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh caches:', error);
    }
  }

  /**
   * Test cache performance
   */
  async testPerformance(formSlug = 'simulazione-mutui') {
    console.group(`⚡ Testing cache performance for: ${formSlug}`);
    
    // Clear cache first
    formCacheService.clearFormCache(formSlug);
    
    // Test cold load (no cache)
    console.time('Cold Load (no cache)');
    await formDefinitionService.getFormDefinition(formSlug);
    console.timeEnd('Cold Load (no cache)');
    
    // Test warm load (with cache)
    console.time('Warm Load (with cache)');
    await formDefinitionService.getFormDefinition(formSlug);
    console.timeEnd('Warm Load (with cache)');
    
    console.groupEnd();
  }

  /**
   * Show all cached forms
   */
  listCachedForms() {
    const keys = this.getLocalStorageKeys().filter(key => 
      key.startsWith('form-cache-') && !key.includes('stats') && !key.includes('version')
    );
    
    console.group('📋 Cached Forms');
    keys.forEach(key => {
      const formSlug = key.replace('form-cache-', '');
      try {
        const cached = JSON.parse(localStorage.getItem(key) || '{}');
        const ageMinutes = Math.round((Date.now() - cached.timestamp) / (1000 * 60));
        console.log(`📄 ${formSlug} (cached ${ageMinutes}m ago, ${cached.hits || 0} hits)`);
      } catch (error) {
        console.warn(`⚠️ Failed to parse cache for ${formSlug}`);
      }
    });
    console.groupEnd();
    
    return keys.map(key => key.replace('form-cache-', ''));
  }

  /**
   * Monitor cache usage
   */
  startMonitoring() {
    console.log('👁️ Starting cache monitoring (check console every 30s)');
    
    const monitor = () => {
      const stats = formCacheService.getCacheStats();
      console.log(`📊 Cache Stats - Entries: ${stats.totalEntries}, Hits: ${stats.totalHits}, Size: ${stats.cacheSize}`);
    };
    
    // Initial report
    monitor();
    
    // Report every 30 seconds
    const interval = setInterval(monitor, 30000);
    
    // Return stop function
    return () => {
      clearInterval(interval);
      console.log('⏹️ Cache monitoring stopped');
    };
  }

  private getLocalStorageKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys.filter(key => key.includes('form') || key.includes('cache'));
  }
}

// Create global debugger instance
const cacheDebugger = new CacheDebugger();

// Make it available globally for console access
declare global {
  interface Window {
    formCacheDebugger: CacheDebugger;
  }
}

if (typeof window !== 'undefined') {
  window.formCacheDebugger = cacheDebugger;
  
  // Show helpful message on first load
  console.log('🚀 Form Cache Debugger loaded! Try these commands:');
  console.log('- window.formCacheDebugger.getInfo() - Get cache info');
  console.log('- window.formCacheDebugger.clearAll() - Clear all caches');
  console.log('- window.formCacheDebugger.refreshAll() - Refresh all caches');
  console.log('- window.formCacheDebugger.testPerformance() - Test cache performance');
  console.log('- window.formCacheDebugger.listCachedForms() - List cached forms');
  console.log('- window.formCacheDebugger.startMonitoring() - Monitor cache usage');
}

export { cacheDebugger };
