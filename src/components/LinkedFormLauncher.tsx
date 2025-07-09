
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormProvider } from '@/contexts/FormContext';
import { formCacheService } from '@/services/formCacheService';
import { supabase } from '@/integrations/supabase/client';
import { Block } from '@/types/form';
import { allBlocks } from '@/data/blocks';
import Form from '@/pages/Form';

const LinkedFormLauncher = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkedFormData, setLinkedFormData] = useState<any>(null);

  useEffect(() => {
    const loadLinkedForm = async () => {
      if (!token) {
        setError('Token mancante');
        setLoading(false);
        return;
      }

      try {
        console.log('🔗 Loading linked form with token:', token);

        // Get linked form data
        const { data: linkedForm, error: linkedFormError } = await supabase
          .from('linked_forms')
          .select(`
            *,
            forms!inner (
              id,
              slug,
              title,
              form_type
            )
          `)
          .eq('link_token', token)
          .eq('status', 'active')
          .single();

        if (linkedFormError || !linkedForm) {
          console.error('❌ Linked form not found:', linkedFormError);
          setError('Form collegato non trovato o scaduto');
          setLoading(false);
          return;
        }

        // Check expiry
        const now = new Date();
        const expiresAt = new Date(linkedForm.expires_at);
        if (now > expiresAt) {
          console.log('❌ Linked form expired');
          setError('Form collegato scaduto');
          setLoading(false);
          return;
        }

        console.log('✅ Linked form loaded:', linkedForm);
        setLinkedFormData(linkedForm);

        // Update last accessed
        await supabase
          .from('linked_forms')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('link_token', token);

        // Send webhook: form_accessed
        try {
          await supabase.functions.invoke('webhook-sender', {
            body: {
              link_token: token,
              event_type: 'form_accessed',
              data: {
                form_slug: linkedForm.forms.slug,
                form_title: linkedForm.forms.title
              }
            }
          });
        } catch (webhookError) {
          console.warn('⚠️ Webhook failed:', webhookError);
        }

        // Load form blocks
        const formSlug = linkedForm.forms.slug;
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
          console.log('📦 Using static blocks for form type:', formSlug);
          setBlocks(allBlocks);
        }

      } catch (error) {
        console.error('❌ Error loading linked form:', error);
        setError('Errore nel caricamento del form');
      } finally {
        setLoading(false);
      }
    };

    loadLinkedForm();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-8 h-8 border-4 border-[#245C4F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-[#245C4F] mb-2">
            Caricamento simulazione...
          </h1>
          <p className="text-gray-600">
            Stiamo preparando il tuo form personalizzato
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Errore di accesso
          </h1>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#245C4F] text-white px-6 py-2 rounded-lg hover:bg-[#1e4f44] transition-colors"
          >
            Torna alla home
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider 
      blocks={blocks} 
      linkedFormData={linkedFormData}
    >
      <Form />
    </FormProvider>
  );
};

export default LinkedFormLauncher;
