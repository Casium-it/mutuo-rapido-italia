
import { formCacheService } from '@/services/formCacheService';
import { Block } from '@/types/form';

/**
 * Get blocks for a specific form - now always loads from database/cache
 */
export const getBlocksForForm = async (formSlug?: string): Promise<Block[]> => {
  if (!formSlug) {
    console.warn('⚠️ No form slug provided to getBlocksForForm');
    return [];
  }

  try {
    const cachedForm = await formCacheService.getForm(formSlug);
    if (cachedForm && cachedForm.blocks.length > 0) {
      console.log(`📦 Using cached blocks for form: ${formSlug} (${cachedForm.blocks.length} blocks)`);
      return cachedForm.blocks;
    }
  } catch (error) {
    console.error(`❌ Error loading blocks for form ${formSlug}:`, error);
  }

  console.error(`❌ No blocks available for form: ${formSlug}`);
  return [];
};

/**
 * Check if form cache is available and valid
 */
export const isFormCacheAvailable = (formSlug: string): boolean => {
  try {
    const cached = localStorage.getItem(`form-cache-${formSlug}`);
    if (!cached) return false;
    
    const formCache = JSON.parse(cached);
    const age = Date.now() - formCache.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return age < maxAge && formCache.blocks && formCache.blocks.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Get form metadata from cache
 */
export const getFormMetadata = async (formSlug: string) => {
  try {
    const cachedForm = await formCacheService.getForm(formSlug);
    return cachedForm?.data || null;
  } catch (error) {
    console.error(`❌ Error getting form metadata for ${formSlug}:`, error);
    return null;
  }
};

/**
 * Force refresh form cache from database
 */
export const refreshFormCache = async (formSlug?: string): Promise<void> => {
  try {
    if (formSlug) {
      formCacheService.clearCache(formSlug);
      await formCacheService.getForm(formSlug);
    } else {
      formCacheService.clearCache();
      await formCacheService.loadAndCacheAllForms();
    }
  } catch (error) {
    console.error('❌ Error refreshing form cache:', error);
    throw error;
  }
};
