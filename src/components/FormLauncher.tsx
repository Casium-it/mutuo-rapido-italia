
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FormProvider } from '@/contexts/FormContext';
import { useLinkedForm } from '@/hooks/useLinkedForm';
import Form from '@/pages/Form';

/**
 * Component per gestire il lancio di form normali e linkati dal CRM
 */
const FormLauncher = () => {
  const { formSlug, blockId, questionId } = useParams();
  const navigate = useNavigate();
  const { isLinkedForm, tokenValidation, markAsUsed } = useLinkedForm();
  const [hasMarkedAsUsed, setHasMarkedAsUsed] = useState(false);

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

  // Mostra loading durante la validazione del token
  if (isLinkedForm && tokenValidation.loading) {
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
    <FormProvider>
      <Form />
    </FormProvider>
  );
};

export default FormLauncher;
