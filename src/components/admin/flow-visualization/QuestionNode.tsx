
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types/form';
import { Hash, FileText, Blocks } from 'lucide-react';
import { OptionCard } from './OptionCard';
import { PlaceholderCard } from './PlaceholderCard';

interface QuestionNodeProps {
  data: {
    question: Question;
    blockId: string;
  };
}

export function QuestionNode({ data }: QuestionNodeProps) {
  const { question } = data;

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'select':
        return <Hash className="h-3 w-3" />;
      case 'input':
        return <FileText className="h-3 w-3" />;
      case 'MultiBlockManager':
        return <Blocks className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const renderPlaceholders = () => {
    const elements: JSX.Element[] = [];

    Object.entries(question.placeholders).forEach(([placeholderKey, placeholder], placeholderIndex) => {
      if (placeholder.type === 'select' && placeholder.options) {
        // Render select placeholder header
        elements.push(
          <div key={`${placeholderKey}-header`} className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                {getQuestionTypeIcon(placeholder.type)}
                {placeholderKey} (select)
              </Badge>
              {placeholder.multiple && (
                <Badge variant="secondary" className="text-xs">
                  Multipla
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {placeholder.placeholder_label || 'Seleziona un\'opzione'}
            </div>
            
            {/* Render each option as a card */}
            <div className="space-y-1">
              {placeholder.options.map((option, optionIndex) => {
                const handleId = `${placeholderKey}-${optionIndex}`;
                return (
                  <OptionCard
                    key={handleId}
                    option={option}
                    handleId={handleId}
                    placeholderKey={placeholderKey}
                    index={optionIndex}
                  />
                );
              })}
            </div>
          </div>
        );
      } else {
        // Render input/MultiBlockManager placeholder
        elements.push(
          <PlaceholderCard
            key={placeholderKey}
            placeholder={placeholder}
            placeholderKey={placeholderKey}
            index={placeholderIndex}
          />
        );
      }
    });

    return elements;
  };

  return (
    <Card className="min-w-[350px] max-w-[450px] border-2 border-[#245C4F] shadow-lg bg-white">
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-[#245C4F] !border-[#245C4F] !w-4 !h-4 !left-[-8px]"
      />
      
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs font-mono">
            #{question.question_number}
          </Badge>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {question.question_id}
          </code>
          {question.inline && (
            <Badge variant="secondary" className="text-xs">
              Inline
            </Badge>
          )}
          {question.endOfForm && (
            <Badge variant="secondary" className="text-xs">
              Fine Form
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Question text */}
        <div className="mb-4 p-3 bg-[#245C4F]/5 border border-[#245C4F]/20 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-1">Testo della domanda:</div>
          <div className="text-sm text-gray-700">
            {question.question_text}
          </div>
        </div>
        
        {/* Question notes */}
        {question.question_notes && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs font-medium text-blue-800 mb-1">Note:</div>
            <div className="text-xs text-blue-700">
              {question.question_notes}
            </div>
          </div>
        )}
        
        {/* Placeholders */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">
            Placeholder e Connessioni ({Object.keys(question.placeholders).length})
          </div>
          {Object.keys(question.placeholders).length === 0 ? (
            <div className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded">
              Nessun placeholder configurato
            </div>
          ) : (
            <div className="space-y-3">
              {renderPlaceholders()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
