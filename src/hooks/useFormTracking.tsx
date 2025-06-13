
import { useCallback } from 'react';
import { useFormExtended } from './useFormExtended';
import { trackFormReply } from '@/utils/analytics';

export function useFormTracking() {
  const { updateQuestionResponse } = useFormExtended();

  const updateResponseWithTracking = useCallback((
    questionId: string,
    value: any,
    questionText?: string,
    blockId?: string
  ) => {
    // Call original update function
    updateQuestionResponse(questionId, value);
    
    // Track the form reply
    trackFormReply(questionId, blockId || 'unknown', value, questionText);
  }, [updateQuestionResponse]);

  return {
    updateResponseWithTracking
  };
}
