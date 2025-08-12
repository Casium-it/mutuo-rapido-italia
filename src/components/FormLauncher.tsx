
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormProvider } from '@/contexts/FormContext';
import { formCacheService } from '@/services/formCacheService';
import { Block } from '@/types/form';
import Form from '@/pages/Form';

const FormLauncher = () => {
  const { formSlug } = useParams();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlocks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!formSlug) {
          throw new Error('Form slug is required');
        }

        console.log(`🔄 Loading blocks for form: ${formSlug}`);
        
        // Always try to load from database/cache first
        const cachedForm = await formCacheService.getForm(formSlug);
        
        if (cachedForm && cachedForm.blocks.length > 0) {
          console.log(`✅ Successfully loaded ${cachedForm.blocks.length} blocks from cache`);
          setBlocks(cachedForm.blocks);
        } else {
          // If no cached form found, try to load all forms and then retry
          console.log('⚠️ No cached form found, attempting to load all forms...');
          await formCacheService.loadAndCacheAllForms();
          
          const retryForm = await formCacheService.getForm(formSlug);
          if (retryForm && retryForm.blocks.length > 0) {
            console.log(`✅ Successfully loaded ${retryForm.blocks.length} blocks after retry`);
            setBlocks(retryForm.blocks);
          } else {
            throw new Error(`Form "${formSlug}" not found in database. Please check if the form exists and is active.`);
          }
        }
      } catch (error) {
        console.error('❌ Critical error loading form blocks:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Failed to load form: ${errorMessage}`);
        setBlocks([]); // Ensure empty blocks instead of fallback
      } finally {
        setLoading(false);
      }
    };

    loadBlocks();
  }, [formSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#245C4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento simulazione...</p>
        </div>
      </div>
    );
  }

  if (error || blocks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f2]">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulazione non disponibile</h2>
          <p className="text-gray-600 mb-4">
            {error || 'La simulazione richiesta non è attualmente disponibile.'}
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-[#245C4F] text-white px-6 py-2 rounded-lg hover:bg-[#1e4f44] transition-colors"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider blocks={blocks} formSlug={formSlug}>
      <Form />
    </FormProvider>
  );
};

export default FormLauncher;
