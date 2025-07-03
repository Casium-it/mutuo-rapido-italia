
import { useState, useEffect } from 'react';
import { Block } from '@/types/form';
import { FormCache } from '@/types/cache';
import { formCacheService } from '@/services/formCacheService';

interface UseFormCacheResult {
  forms: FormCache[];
  blocks: Block[];
  loading: boolean;
  error: string | null;
  refreshCache: () => Promise<void>;
  getFormBySlug: (slug: string) => Promise<FormCache | null>;
}

export const useFormCache = (formSlug?: string): UseFormCacheResult => {
  const [forms, setForms] = useState<FormCache[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadForms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (formSlug) {
        // Load specific form
        const form = await formCacheService.getForm(formSlug);
        if (form) {
          setForms([form]);
          setBlocks(form.blocks);
        } else {
          // Fallback to static blocks
          console.warn(`⚠️ Form not found: ${formSlug}, using fallback blocks`);
          const fallbackBlocks = formCacheService.getFallbackBlocks();
          setBlocks(fallbackBlocks);
          setForms([]);
        }
      } else {
        // Load all forms
        await formCacheService.loadAndCacheAllForms();
        // Get cached forms from localStorage
        const cachedForms = getCachedForms();
        setForms(cachedForms);
        
        // If no forms found, use fallback blocks
        if (cachedForms.length === 0) {
          const fallbackBlocks = formCacheService.getFallbackBlocks();
          setBlocks(fallbackBlocks);
        }
      }
    } catch (err) {
      console.error('❌ Error loading forms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load forms');
      
      // Fallback to static blocks on error
      const fallbackBlocks = formCacheService.getFallbackBlocks();
      setBlocks(fallbackBlocks);
    } finally {
      setLoading(false);
    }
  };

  const getCachedForms = (): FormCache[] => {
    const forms: FormCache[] = [];
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('form-cache-')
    );
    
    keys.forEach(key => {
      try {
        const cached = JSON.parse(localStorage.getItem(key) || '{}');
        if (cached && cached.data) {
          forms.push(cached);
        }
      } catch (error) {
        console.error(`❌ Failed to parse cached form: ${key}`, error);
      }
    });
    
    return forms.sort((a, b) => a.data.title.localeCompare(b.data.title));
  };

  const refreshCache = async () => {
    formCacheService.clearCache();
    await loadForms();
  };

  const getFormBySlug = async (slug: string): Promise<FormCache | null> => {
    return await formCacheService.getForm(slug);
  };

  useEffect(() => {
    loadForms();
    
    // Clean up expired caches on hook initialization
    formCacheService.clearExpiredCaches();
  }, [formSlug]);

  return {
    forms,
    blocks,
    loading,
    error,
    refreshCache,
    getFormBySlug,
  };
};
