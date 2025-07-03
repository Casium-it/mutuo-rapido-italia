
import React from 'react';
import { useParams } from 'react-router-dom';
import { FormSnapshotLoader } from './FormSnapshotLoader';
import { FormProvider } from '@/contexts/FormContext';
import Form from '@/pages/Form';

export const FormRouteHandler: React.FC = () => {
  const { formSlug } = useParams<{ formSlug?: string }>();

  console.log('FormRouteHandler: Rendering with formSlug:', formSlug);

  return (
    <FormSnapshotLoader formSlug={formSlug}>
      {(blocks, isLoading, error, formInfo) => {
        console.log('FormRouteHandler: FormSnapshotLoader callback', { 
          blocksCount: blocks.length, 
          isLoading, 
          error,
          formSlug: formInfo?.formSlug 
        });
        
        if (isLoading || error) {
          return null;
        }
        
        return (
          <FormProvider blocks={blocks}>
            <Form />
          </FormProvider>
        );
      }}
    </FormSnapshotLoader>
  );
};
