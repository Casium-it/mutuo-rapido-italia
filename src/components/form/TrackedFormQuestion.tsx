
import React from 'react';
import { FormQuestion } from './FormQuestion';
import { useFormTracking } from '@/hooks/useFormTracking';
import { useFormExtended } from '@/hooks/useFormExtended';

interface TrackedFormQuestionProps {
  question: any;
}

export function TrackedFormQuestion({ question }: TrackedFormQuestionProps) {
  const { updateResponseWithTracking } = useFormTracking();
  const { state, blocks } = useFormExtended();

  // Find the current block to get block_id
  const currentBlock = blocks.find(block => 
    block.questions.some(q => q.question_id === question.question_id)
  );

  // Override the question's response handler to include tracking
  const questionWithTracking = {
    ...question,
    onResponse: (value: any) => {
      updateResponseWithTracking(
        question.question_id,
        value,
        question.question_text,
        currentBlock?.block_id
      );
    }
  };

  return <FormQuestion question={questionWithTracking} />;
}
