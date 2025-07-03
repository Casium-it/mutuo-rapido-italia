import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question, SelectPlaceholder } from '@/types/form';
import { FileText, Hash, List } from 'lucide-react';

interface QuestionCardProps {
  data: {
    question: Question;
    questionNumber: number;
  };
}

export function QuestionCard({ data }: QuestionCardProps) {
  const { question, questionNumber } = data;
  
  // Find select placeholders to determine if this is a multiple choice question
  const selectPlaceholders = Object.entries(question.placeholders).filter(
    ([_, placeholder]) => placeholder.type === 'select'
  ) as [string, SelectPlaceholder][];
  
  const isMultipleChoice = selectPlaceholders.length > 0;
  const totalOptions = selectPlaceholders.reduce((total, [_, placeholder]) => {
    return total + (placeholder.options?.length || 0);
  }, 0);
  
  return (
    <>
      <Card className="w-80 border-2 border-[#BEB8AE] bg-white shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-3 bg-gradient-to-r from-[#245C4F]/5 to-[#245C4F]/10">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#245C4F]" />
            <Badge variant="outline" className="text-xs font-mono">
              #{question.question_number}
            </Badge>
            <span className="text-[#245C4F]">Domanda {questionNumber}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-3">
          {/* Question Text */}
          <p className="text-sm text-gray-700 mb-3 line-clamp-2 font-medium">
            {question.question_text.replace(/\{\{[^}]+\}\}/g, '____')}
          </p>
          
          {/* Question Properties */}
          <div className="flex gap-1 flex-wrap mb-3">
            {question.inline && (
              <Badge variant="secondary" className="text-xs">Inline</Badge>
            )}
            {question.endOfForm && (
              <Badge variant="secondary" className="text-xs">Fine Form</Badge>
            )}
            {question.skippableWithNotSure && (
              <Badge variant="secondary" className="text-xs">Saltabile</Badge>
            )}
          </div>
          
          {/* Placeholder Info */}
          <div className="space-y-2">
            {isMultipleChoice ? (
              <div className="bg-blue-50 p-2 rounded border border-blue-200">
                <div className="text-xs font-medium text-blue-700 flex items-center gap-1 mb-1">
                  <List className="h-3 w-3" />
                  Scelta Multipla ({totalOptions} opzioni)
                </div>
                <div className="text-xs text-blue-600">
                  Ogni opzione ha una freccia verso la destinazione
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-2 rounded border border-gray-200">
                <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Input Diretto
                </div>
                <div className="text-xs text-gray-600">
                  Una singola freccia verso la destinazione
                </div>
              </div>
            )}
          </div>
          
          {/* Question ID */}
          <code className="text-xs text-gray-500 block mt-3 truncate bg-gray-100 px-2 py-1 rounded">
            {question.question_id}
          </code>
        </CardContent>
      </Card>
      
      {/* Input handle (left side) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 bg-[#245C4F] border-2 border-white shadow-md"
      />
      
      {/* Output handles (right side) */}
      {isMultipleChoice ? (
        // Multiple handles for each option in select placeholders
        <>
          {(() => {
            let currentOptionIndex = 0;
            return selectPlaceholders.flatMap(([placeholderKey, placeholder]) => 
              placeholder.options.map((option, optIndex) => {
                const handleId = `option-${currentOptionIndex}`;
                // Position handles evenly along the right side
                const handlePosition = ((currentOptionIndex + 1) / (totalOptions + 1)) * 100;
                currentOptionIndex++;
                
                return (
                  <Handle
                    key={handleId}
                    type="source"
                    position={Position.Right}
                    id={handleId}
                    className="w-3 h-3 bg-blue-500 border-2 border-white shadow-md"
                    style={{ 
                      top: `${handlePosition}%`,
                      transform: 'translateY(-50%)'
                    }}
                  />
                );
              })
            );
          })()}
        </>
      ) : (
        // Single handle for simple questions
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 bg-[#245C4F] border-2 border-white shadow-md"
        />
      )}
    </>
  );
}