
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormProvider } from '@/contexts/FormContext';
import { formCacheService } from '@/services/formCacheService';
import { Block } from '@/types/form';
import { allBlocks } from '@/data/blocks';
import Form from '@/pages/Form';

const FormLauncher = () => {
  const { formSlug } = useParams();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlocks = async () => {
      try {
        setLoading(true);
        
        // Try to load from cache if formSlug is 'simulazione-mutuo'
        if (formSlug === 'simulazione-mutuo') {
          console.log('🔄 Loading blocks from cache for simulazione-mutuo form...');
          const cachedForm = await formCacheService.getForm('simulazione-mutuo');
          
          if (cachedForm && cachedForm.blocks.length > 0) {
            console.log('✅ Using cached blocks from simulazione-mutuo');
            setBlocks(cachedForm.blocks);
          } else {
            console.log('⚠️ Cache miss, using fallback static blocks');
            setBlocks(allBlocks);
          }
        } else {
          // For other form types, use static blocks
          console.log('📦 Using static blocks for form type:', formSlug);
          setBlocks(allBlocks);
        }
      } catch (error) {
        console.error('❌ Error loading blocks, using fallback:', error);
        setBlocks(allBlocks);
      } finally {
        setLoading(false);
      }
    };

    loadBlocks();
  }, [formSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#245C4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento simulazione...</p>
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
