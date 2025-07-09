
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FormProvider } from '@/contexts/FormContext';
import { useLinkedForm } from '@/hooks/useLinkedForm';
import Form from '@/pages/Form';
import { formCacheService } from '@/services/formCacheService';
import { allBlocks } from '@/data/blocks';
import { Block } from '@/types/form';

/**
 * Component per gestire il lancio di form normali e linkati dal CRM
 */
const FormLauncher = () => {
  const { formSlug, blockId, questionId } = useParams();
  const navigate = useNavigate();
  const { isLinkedForm, tokenValidation, markAsUsed } = useLinkedForm();
  const [hasMarkedAsUsed, setHasMarkedAsUsed] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(true);

  // Load blocks for the form
  useEffect(() => {
    const loadBlocks = async () => {
      if (!formSlug) {
        setBlocks(allBlocks);
        setBlocksLoading(false);
        return;
      }

      try {
        // Try to get blocks from cache first
        const cachedForm = await formCacheService.getForm(formSlug);
        if (cachedForm?.blocks) {
          setBlocks(cachedForm.blocks);
        } else {
          // Fallback to static blocks
          setBlocks(allBlocks);
        }
      } catch (error) {
        console.error('Error loading blocks:', error);
        // Fallback to static blocks
        setBlocks(allBlocks);
      } finally {
        setBlocksLoading(false);
      }
    };

    loadBlocks();
  }, [formSlug]);

  // Se è un form linkato, gestisci la validazione del token
  useEffect(() => {
    if (isLinkedForm) {
      // Se la validazione è completata e il token non è valido, reindirizza
      if (!tokenValidation.loading && !tokenValidation.valid) {
        console.error('Token validation failed:', tokenValidation.error);
        navigate('/not-found');
        return;
      }

      // Se il token è valido e non è ancora stato marcato come usato
      if (tokenValidation.valid && !hasMarkedAsUsed) {
        markAsUsed().then((success) => {
          if (success) {
            setHasMarkedAsUsed(true);
            console.log('Token marked as used and form_started webhook sent');
          } else {
            console.error('Failed to mark token as used');
          }
        });
      }
    }
  }, [isLinkedForm, tokenValidation, hasMarkedAsUsed, markAsUsed, navigate]);

  // Mostra loading durante il caricamento dei blocchi o la validazione del token
  if (blocksLoading || (isLinkedForm && tokenValidation.loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#245C4F] mx-auto mb-4"></div>
          <p className="text-gray-600">Validazione in corso...</p>
        </div>
      </div>
    );
  }

  // Se il token non è valido, il redirect è già gestito nell'useEffect
  if (isLinkedForm && !tokenValidation.valid) {
    return null;
  }

  // Rendering del form normale
  return (
    <FormProvider blocks={blocks} formSlug={formSlug}>
      <Form />
    </FormProvider>
  );
};

export default FormLauncher;
