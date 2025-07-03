import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateButtonsProps {
  onCreateQuestion: () => void;
  onCreatePlaceholder: (questionId: string) => void;
  onCreateOption: (questionId: string, placeholderKey: string) => void;
  questionId?: string;
  placeholderKey?: string;
  variant?: 'question' | 'placeholder' | 'option';
}

export const CreateButtons: React.FC<CreateButtonsProps> = ({
  onCreateQuestion,
  onCreatePlaceholder,
  onCreateOption,
  questionId,
  placeholderKey,
  variant = 'question'
}) => {
  if (variant === 'question') {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={onCreateQuestion}
      >
        <Plus className="h-4 w-4" />
        Nuova Domanda
      </Button>
    );
  }

  if (variant === 'placeholder' && questionId) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-xs"
        onClick={() => onCreatePlaceholder(questionId)}
      >
        <Plus className="h-3 w-3" />
        Nuovo Placeholder
      </Button>
    );
  }

  if (variant === 'option' && questionId && placeholderKey) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-xs"
        onClick={() => onCreateOption(questionId, placeholderKey)}
      >
        <Plus className="h-3 w-3" />
        Nuova Opzione
      </Button>
    );
  }

  return null;
};