
import { formCacheService } from '@/services/formCacheService';
import { Block } from '@/types/form';
import { allBlocks } from '@/data/blocks';

/**
 * Get blocks for a specific form, with fallback to static blocks
 */
export const getBlocksForForm = async (formSlug?: string): Promise<Block[]> => {
  if (!formSlug) {
    return allBlocks;
  }

  try {
    const cachedForm = await formCacheService.getForm(formSlug);
    if (cachedForm && cachedForm.blocks.length > 0) {
      console.log(`📦 Using cached blocks for form: ${formSlug}`);
      return cachedForm.blocks;
    }
  } catch (error) {
    console.error(`❌ Error loading blocks for form ${formSlug}:`, error);
  }

  console.log(`🔄 Using fallback static blocks for form: ${formSlug}`);
  return allBlocks;
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
    
    return age < maxAge;
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
