
import React, { useState, useEffect } from 'react';
import { FormDefinition, formDefinitionService } from '@/services/formDefinitionService';
import { Block } from '@/types/form';

interface FormSnapshotLoaderProps {
  formSlug?: string;
  children: (blocks: Block[], isLoading: boolean, error: string | null, formInfo?: FormDefinition) => React.ReactNode;
}

export const FormSnapshotLoader: React.FC<FormSnapshotLoaderProps> = ({ 
  formSlug, 
  children 
}) => {
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFormDefinition = async () => {
      console.log(`FormSnapshotLoader: Loading form definition for ${formSlug || 'default'}`);
      setIsLoading(true);
      setError(null);

      try {
        const definition = await formDefinitionService.getFormDefinition(formSlug);
        
        if (isMounted) {
          setFormDefinition(definition);
          console.log(`FormSnapshotLoader: Successfully loaded form definition (${definition.source})`, {
            blocksCount: definition.blocks.length,
            formSlug: definition.formSlug,
            version: definition.version
          });
        }
      } catch (err) {
        console.error('FormSnapshotLoader: Error loading form definition:', err);
        if (isMounted) {
          setError('Errore nel caricamento del modulo. Riprova più tardi.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadFormDefinition();

    return () => {
      isMounted = false;
    };
  }, [formSlug]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#245C4F] mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento modulo...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !formDefinition) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f5f1]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Errore nel caricamento del modulo'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#245C4F] text-white rounded hover:bg-[#1e4f44]"
            >
              Riprova
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render with loaded form definition
  return (
    <>
      {children(formDefinition.blocks, isLoading, error, formDefinition)}
    </>
  );
};
