import React from 'react';
import { useParams } from 'react-router-dom';
import { FormProvider } from '@/contexts/FormContext';
import { getBlocksForForm } from '@/utils/formCacheUtils';
import { allBlocks } from '@/data/blocks';
import Form from '@/pages/Form';
import FormLoading from '@/pages/FormLoading';

export const FormRoute = () => {
  const { formSlug } = useParams<{ formSlug: string }>();
  const [blocks, setBlocks] = React.useState(allBlocks); // Start with fallback
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadBlocks = async () => {
      try {
        if (formSlug) {
          const cachedBlocks = await getBlocksForForm(formSlug);
          setBlocks(cachedBlocks);
          console.log(`📦 Loaded ${cachedBlocks.length} blocks for form: ${formSlug}`);
        }
      } catch (error) {
        console.error(`❌ Error loading blocks for ${formSlug}:`, error);
        // Keep fallback blocks
      } finally {
        setLoading(false);
      }
    };

    loadBlocks();
  }, [formSlug]);

  if (loading) {
    return <FormLoading />;
  }

  return (
    <FormProvider blocks={blocks}>
      <Form />
    </FormProvider>
  );
};
