
import { Block } from '@/types/form';
import { formCacheService } from './formCacheService';
import { formSnapshotService, FormSnapshot } from './formSnapshotService';

export interface FormDefinition {
  formSlug?: string;
  blocks: Block[];
  source: 'database' | 'static';
  version?: number;
  title?: string;
  description?: string;
}

class FormDefinitionService {
  /**
   * Get form definition with enhanced caching
   */
  async getFormDefinition(formSlug?: string): Promise<FormDefinition> {
    console.log(`FormDefinitionService: Getting form definition for ${formSlug || 'default'}`);

    // For database-driven forms
    if (formSlug) {
      try {
        // Use the enhanced cache service
        const snapshot = await formCacheService.getFormSnapshot(formSlug);
        
        if (snapshot) {
          console.log(`FormDefinitionService: Found database form for ${formSlug}`, {
            blocksCount: snapshot.blocks.length,
            version: snapshot.version
          });
          
          return {
            formSlug: snapshot.slug,
            blocks: snapshot.blocks,
            source: 'database',
            version: snapshot.version,
            title: snapshot.title,
            description: snapshot.description
          };
        } else {
          console.log(`FormDefinitionService: No database form found for ${formSlug}, falling back to static`);
        }
      } catch (error) {
        console.error(`FormDefinitionService: Error loading database form ${formSlug}:`, error);
      }
    }

    // Fallback to static form blocks (legacy support)
    console.log('FormDefinitionService: Using static form blocks as fallback');
    
    // Import static blocks dynamically to avoid circular dependencies
    const { formBlocks } = await import('@/data/formBlocks');
    
    return {
      blocks: formBlocks,
      source: 'static'
    };
  }

  /**
   * Preload common forms
   */
  async preloadCommonForms(): Promise<void> {
    await formCacheService.preloadCommonForms();
  }

  /**
   * Clear cache for specific form
   */
  clearFormCache(formSlug: string): void {
    formCacheService.clearFormCache(formSlug);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    formCacheService.clearAllCaches();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return formCacheService.getCacheStats();
  }

  /**
   * Check if form exists in database
   */
  async formExists(formSlug: string): Promise<boolean> {
    return await formSnapshotService.formExists(formSlug);
  }

  /**
   * Get all available forms
   */
  async getAllForms() {
    return await formSnapshotService.getAllForms();
  }
}

// Export singleton instance
export const formDefinitionService = new FormDefinitionService();
