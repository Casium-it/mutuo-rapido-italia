
import { useCallback } from 'react';
import { useFormExtended } from './useFormExtended';
import { trackFormReply } from '@/utils/analytics';

export function useFormTracking() {
  const { updateResponse } = useFormExtended();

  const updateResponseWithTracking = useCallback((
    questionId: string,
    value: any,
    questionText?: string,
    blockId?: string
  ) => {
    // Call original update function
    updateResponse(questionId, value);
    
    // Track the form reply
    trackFormReply(questionId, blockId || 'unknown', value, questionText);
  }, [updateResponse]);

  return {
    updateResponseWithTracking
  };
}
