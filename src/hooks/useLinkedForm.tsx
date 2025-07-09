
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LinkedFormService, LinkedFormData } from '@/services/linkedFormService';

interface UseLinkedFormResult {
  isLinkedForm: boolean;
  linkedFormData?: LinkedFormData;
  tokenValidation: {
    loading: boolean;
    valid: boolean;
    error?: string;
  };
  markAsUsed: () => Promise<boolean>;
}

/**
 * Hook per gestire i form linkati dal CRM
 */
export const useLinkedForm = (): UseLinkedFormResult => {
  const [searchParams] = useSearchParams();
  const [linkedFormData, setLinkedFormData] = useState<LinkedFormData | undefined>();
  const [tokenValidation, setTokenValidation] = useState({
    loading: false,
    valid: false,
    error: undefined as string | undefined
  });

  const token = searchParams.get('token');
  const isLinkedForm = !!token;

  useEffect(() => {
    if (!token) {
      setTokenValidation({ loading: false, valid: false });
      return;
    }

    const validateToken = async () => {
      setTokenValidation({ loading: true, valid: false });

      const result = await LinkedFormService.validateToken(token);
      
      if (result.valid && result.linkedForm) {
        setLinkedFormData(result.linkedForm);
        setTokenValidation({ loading: false, valid: true });
      } else {
        setTokenValidation({ 
          loading: false, 
          valid: false, 
          error: result.error 
        });
      }
    };

    validateToken();
  }, [token]);

  const markAsUsed = async (): Promise<boolean> => {
    if (!token) return false;
    return await LinkedFormService.markTokenAsUsed(token);
  };

  return {
    isLinkedForm,
    linkedFormData,
    tokenValidation,
    markAsUsed
  };
};
