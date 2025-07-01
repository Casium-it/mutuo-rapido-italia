
import { formCacheService } from './formCacheService';
import { formSnapshotService } from './formSnapshotService';

class PreloadService {
  private isPreloading = false;
  private preloadPromise: Promise<void> | null = null;

  /**
   * Initialize preloading at application start
   */
  async initialize(): Promise<void> {
    if (this.isPreloading || this.preloadPromise) {
      return this.preloadPromise || Promise.resolve();
    }

    console.log('PreloadService: Starting initialization');
    this.isPreloading = true;

    this.preloadPromise = this.performPreload();
    
    try {
      await this.preloadPromise;
      console.log('PreloadService: Initialization completed successfully');
    } catch (error) {
      console.error('PreloadService: Initialization failed:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Perform the actual preloading
   */
  private async performPreload(): Promise<void> {
    try {
      // 1. Get list of all available forms
      const availableForms = await formSnapshotService.getAllForms();
      
      if (availableForms.length === 0) {
        console.log('PreloadService: No forms available to preload');
        return;
      }

      // 2. Identify high-priority forms (first 3 or marked as common)
      const highPriorityForms = availableForms
        .slice(0, 3) // Take first 3 forms as high priority
        .map(form => form.slug);

      // 3. Preload high-priority forms immediately
      console.log('PreloadService: Preloading high-priority forms:', highPriorityForms);
      await formCacheService.preloadCommonForms(highPriorityForms);

      // 4. Schedule background preloading of remaining forms
      const remainingForms = availableForms
        .slice(3)
        .map(form => form.slug);

      if (remainingForms.length > 0) {
        console.log('PreloadService: Scheduling background preload for remaining forms');
        this.scheduleBackgroundPreload(remainingForms);
      }

    } catch (error) {
      console.error('PreloadService: Error during preload:', error);
      throw error;
    }
  }

  /**
   * Schedule background preloading with delays to avoid blocking
   */
  private scheduleBackgroundPreload(formSlugs: string[]): void {
    const batchSize = 2; // Preload 2 forms at a time
    const delayBetweenBatches = 2000; // 2 seconds between batches

    const preloadBatch = async (batch: string[], batchIndex: number) => {
      if (batchIndex > 0) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }

      console.log(`PreloadService: Background preloading batch ${batchIndex + 1}:`, batch);
      
      try {
        await formCacheService.preloadCommonForms(batch);
      } catch (error) {
        console.warn(`PreloadService: Failed to preload batch ${batchIndex + 1}:`, error);
      }
    };

    // Split forms into batches and preload them
    for (let i = 0; i < formSlugs.length; i += batchSize) {
      const batch = formSlugs.slice(i, i + batchSize);
      const batchIndex = Math.floor(i / batchSize);
      
      // Don't await - let it run in background
      preloadBatch(batch, batchIndex);
    }
  }

  /**
   * Refresh all cached forms in background
   */
  async refreshAllCaches(): Promise<void> {
    console.log('PreloadService: Starting cache refresh');
    
    try {
      // Clear existing caches
      formCacheService.clearAllCaches();
      
      // Reinitialize preloading
      this.preloadPromise = null;
      await this.initialize();
      
      console.log('PreloadService: Cache refresh completed');
    } catch (error) {
      console.error('PreloadService: Cache refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get preload status
   */
  getStatus(): { isPreloading: boolean; hasCompleted: boolean } {
    return {
      isPreloading: this.isPreloading,
      hasCompleted: this.preloadPromise !== null && !this.isPreloading
    };
  }
}

// Export singleton instance
export const preloadService = new PreloadService();
