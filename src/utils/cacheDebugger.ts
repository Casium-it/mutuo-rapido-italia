
import { formCacheService } from '@/services/formCacheService';
import { preloadService } from '@/services/preloadService';
import { formDefinitionService } from '@/services/formDefinitionService';

/**
 * Enhanced cache debugging utilities for browser console with form state inspection
 */
class CacheDebugger {
  /**
   * Get comprehensive cache and form state information
   */
  getInfo() {
    const stats = formCacheService.getCacheStats();
    const preloadStatus = preloadService.getStatus();
    
    console.group('🔍 Form Cache Debug Info');
    console.log('📊 Cache Statistics:', stats);
    console.log('⚡ Preload Status:', preloadStatus);
    console.log('🗂️ Local Storage Keys:', this.getLocalStorageKeys());
    
    // Add form state information if available
    try {
      const formStateKeys = this.getFormStateKeys();
      if (formStateKeys.length > 0) {
        console.log('📝 Form State Keys:', formStateKeys);
        formStateKeys.forEach(key => {
          try {
            const state = JSON.parse(localStorage.getItem(key) || '{}');
            console.log(`   ${key}:`, {
              responsesCount: Object.keys(state.responses || {}).length,
              activeBlocks: state.activeBlocks?.length || 0,
              completedBlocks: state.completedBlocks?.length || 0
            });
          } catch (e) {
            console.warn(`   Failed to parse ${key}`);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to inspect form state');
    }
    
    console.groupEnd();
    
    return {
      stats,
      preloadStatus,
      localStorageKeys: this.getLocalStorageKeys(),
      formStateKeys: this.getFormStateKeys()
    };
  }

  /**
   * Get current form state from context (if available)
   */
  getCurrentFormState() {
    console.group('📊 Current Form State Analysis');
    
    // Try to access form state from window object if available
    if (window.formDebugContext) {
      const context = window.formDebugContext;
      console.log('✅ Form context found:', {
        responsesCount: Object.keys(context.state.responses || {}).length,
        activeBlocksCount: context.state.activeBlocks?.length || 0,
        completedBlocksCount: context.state.completedBlocks?.length || 0,
        dynamicBlocksCount: context.state.dynamicBlocks?.length || 0,
        currentQuestion: context.state.activeQuestion
      });
      
      console.log('📝 Form Responses:', context.state.responses);
      console.log('🧱 Active Blocks:', context.state.activeBlocks);
      console.log('✅ Completed Blocks:', context.state.completedBlocks);
      
      if (context.state.dynamicBlocks?.length > 0) {
        console.log('🔄 Dynamic Blocks:', context.state.dynamicBlocks.map(b => ({
          id: b.block_id,
          title: b.title,
          questionsCount: b.questions?.length || 0
        })));
      }
    } else {
      console.warn('❌ No form context available. Form state can only be inspected when on a form page.');
    }
    
    console.groupEnd();
  }

  /**
   * Clear all caches and form state
   */
  clearAll() {
    console.log('🧹 Clearing all form caches and state...');
    formCacheService.clearAllCaches();
    
    // Clear form state from localStorage
    const formStateKeys = this.getFormStateKeys();
    formStateKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`   Cleared ${key}`);
    });
    
    console.log('✅ All caches and form state cleared');
  }

  /**
   * Clear specific form cache and state
   */
  clearForm(formSlug: string) {
    console.log(`🧹 Clearing cache and state for form: ${formSlug}`);
    formCacheService.clearFormCache(formSlug);
    
    // Clear specific form state
    const stateKey = `form-state-${formSlug}`;
    if (localStorage.getItem(stateKey)) {
      localStorage.removeItem(stateKey);
      console.log(`   Cleared form state: ${stateKey}`);
    }
    
    console.log(`✅ Cache and state cleared for ${formSlug}`);
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
   * Test cache performance with form state analysis
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
    
    // Test form state persistence if available
    const stateKey = `form-state-${formSlug}`;
    const savedState = localStorage.getItem(stateKey);
    if (savedState) {
      console.time('Form State Parse');
      try {
        const parsedState = JSON.parse(savedState);
        console.log('📊 Saved form state:', {
          responsesCount: Object.keys(parsedState.responses || {}).length,
          activeBlocks: parsedState.activeBlocks?.length || 0
        });
      } catch (e) {
        console.warn('Failed to parse saved form state');
      }
      console.timeEnd('Form State Parse');
    }
    
    console.groupEnd();
  }

  /**
   * Show all cached forms and form states
   */
  listCachedForms() {
    console.group('📋 Cached Forms and States');
    
    // Cached forms
    const cacheKeys = this.getLocalStorageKeys().filter(key => 
      key.startsWith('form-cache-') && !key.includes('stats') && !key.includes('version')
    );
    
    console.log('💾 Cached Forms:');
    cacheKeys.forEach(key => {
      const formSlug = key.replace('form-cache-', '');
      try {
        const cached = JSON.parse(localStorage.getItem(key) || '{}');
        const ageMinutes = Math.round((Date.now() - cached.timestamp) / (1000 * 60));
        console.log(`   📄 ${formSlug} (cached ${ageMinutes}m ago, ${cached.hits || 0} hits)`);
      } catch (error) {
        console.warn(`   ⚠️ Failed to parse cache for ${formSlug}`);
      }
    });
    
    // Form states
    const stateKeys = this.getFormStateKeys();
    console.log('📝 Form States:');
    stateKeys.forEach(key => {
      try {
        const state = JSON.parse(localStorage.getItem(key) || '{}');
        const formType = key.replace('form-state-', '');
        console.log(`   📊 ${formType}:`, {
          responses: Object.keys(state.responses || {}).length,
          activeBlocks: state.activeBlocks?.length || 0,
          completed: state.completedBlocks?.length || 0
        });
      } catch (error) {
        console.warn(`   ⚠️ Failed to parse state for ${key}`);
      }
    });
    
    console.groupEnd();
    
    return {
      cachedForms: cacheKeys.map(key => key.replace('form-cache-', '')),
      formStates: stateKeys.map(key => key.replace('form-state-', ''))
    };
  }

  /**
   * Monitor cache usage and form state changes
   */
  startMonitoring() {
    console.log('👁️ Starting cache and form state monitoring (check console every 30s)');
    
    const monitor = () => {
      const stats = formCacheService.getCacheStats();
      const stateKeys = this.getFormStateKeys();
      console.log(`📊 Monitor - Cache: ${stats.totalEntries} entries, ${stats.totalHits} hits | Form States: ${stateKeys.length}`);
    };
    
    // Initial report
    monitor();
    
    // Report every 30 seconds
    const interval = setInterval(monitor, 30000);
    
    // Return stop function
    return () => {
      clearInterval(interval);
      console.log('⏹️ Cache and form state monitoring stopped');
    };
  }

  /**
   * Export current form state for debugging
   */
  exportCurrentFormState() {
    if (!window.formDebugContext) {
      console.warn('❌ No form context available for export');
      return null;
    }
    
    const exportData = {
      timestamp: new Date().toISOString(),
      formState: window.formDebugContext.state,
      blocks: window.formDebugContext.blocks?.map(b => ({
        id: b.block_id,
        title: b.title,
        questionsCount: b.questions?.length || 0
      })) || []
    };
    
    console.log('📤 Exported form state:', exportData);
    
    // Also copy to clipboard if possible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
        .then(() => console.log('📋 Form state copied to clipboard'))
        .catch(() => console.log('❌ Failed to copy to clipboard'));
    }
    
    return exportData;
  }

  private getLocalStorageKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys.filter(key => key.includes('form') || key.includes('cache'));
  }

  private getFormStateKeys(): string[] {
    return this.getLocalStorageKeys().filter(key => key.startsWith('form-state-'));
  }
}

// Create global debugger instance
const cacheDebugger = new CacheDebugger();

// Make it available globally for console access
declare global {
  interface Window {
    formCacheDebugger: CacheDebugger;
    formDebugContext?: {
      state: any;
      blocks: any[];
    };
  }
}

if (typeof window !== 'undefined') {
  window.formCacheDebugger = cacheDebugger;
  
  // Show helpful message on first load
  console.log('🚀 Enhanced Form Cache Debugger loaded! Try these commands:');
  console.log('- window.formCacheDebugger.getInfo() - Get cache info');
  console.log('- window.formCacheDebugger.getCurrentFormState() - Get current form state');
  console.log('- window.formCacheDebugger.clearAll() - Clear all caches and states');
  console.log('- window.formCacheDebugger.refreshAll() - Refresh all caches');
  console.log('- window.formCacheDebugger.testPerformance() - Test cache performance');
  console.log('- window.formCacheDebugger.listCachedForms() - List cached forms and states');
  console.log('- window.formCacheDebugger.exportCurrentFormState() - Export current form state');
  console.log('- window.formCacheDebugger.startMonitoring() - Monitor cache usage');
}

export { cacheDebugger };
