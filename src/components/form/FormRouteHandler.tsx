
import React from 'react';
import { useParams } from 'react-router-dom';
import { FormSnapshotLoader } from './FormSnapshotLoader';
import { FormProvider } from '@/contexts/FormContext';
import Form from '@/pages/Form';

export const FormRouteHandler: React.FC = () => {
  const { formSlug } = useParams<{ formSlug?: string }>();

  return (
    <FormSnapshotLoader formSlug={formSlug}>
      {(blocks, isLoading, error) => 
        !isLoading && !error ? (
          <FormProvider blocks={blocks}>
            <Form />
          </FormProvider>
        ) : null
      }
    </FormSnapshotLoader>
  );
};
