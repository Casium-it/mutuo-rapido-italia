
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types/form';
import { FileText, List, Plus, ArrowRight, Square } from 'lucide-react';

interface QuestionNodeProps {
  data: {
    question: Question;
    questionNumber: number;
  };
}

export function QuestionNode({ data }: QuestionNodeProps) {
  const { question, questionNumber } = data;
  
  // Check if this question has select placeholders
  const selectPlaceholders = Object.entries(question.placeholders).filter(
    ([_, placeholder]) => placeholder.type === 'select'
  );
  
  const hasSelectOptions = selectPlaceholders.length > 0;
  
  const getLeadsToIcon = (leadsTo: string) => {
    if (leadsTo === 'stop_flow') return <Square className="h-3 w-3 text-red-600" />;
    if (leadsTo === 'next_block') return <ArrowRight className="h-3 w-3 text-yellow-600" />;
    return <ArrowRight className="h-3 w-3 text-blue-600" />;
  };
  
  const getLeadsToColor = (leadsTo: string) => {
    if (leadsTo === 'stop_flow') return 'text-red-700 bg-red-50 border-red-200';
    if (leadsTo === 'next_block') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-blue-700 bg-blue-50 border-blue-200';
  };
  
  // Calculate total options for handle positioning
  const totalOptions = selectPlaceholders.reduce((total, [_, placeholder]) => {
    return total + (placeholder.type === 'select' ? (placeholder.options?.length || 0) : 0);
  }, 0);
  
  return (
    <Card className={`${hasSelectOptions ? 'w-80' : 'w-64'} border-2 border-blue-200 shadow-md`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <Badge variant="outline" className="text-xs">
            #{question.question_number}
          </Badge>
          Domanda {questionNumber}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-700 mb-2 line-clamp-3">
          {question.question_text.replace(/\{\{[^}]+\}\}/g, '____')}
        </p>
        
        {/* Question Properties */}
        <div className="flex gap-1 flex-wrap mb-2">
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
        
        {/* Select Options */}
        {hasSelectOptions && (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
              <List className="h-3 w-3" />
              Opzioni:
            </div>
            {selectPlaceholders.map(([placeholderKey, placeholder]) => (
              <div key={placeholderKey} className="space-y-1">
                {placeholder.type === 'select' && placeholder.options?.map((option, optIndex) => (
                  <div
                    key={option.id}
                    className={`text-xs p-2 rounded border ${getLeadsToColor(option.leads_to)} 
                              flex items-center justify-between relative`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{option.label}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {getLeadsToIcon(option.leads_to)}
                        <code className="text-xs">{option.leads_to}</code>
                      </div>
                    </div>
                    {option.add_block && (
                      <div className="flex items-center gap-1 ml-2">
                        <Plus className="h-3 w-3 text-green-600" />
                        <code className="text-xs text-green-700">{option.add_block}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        
        <code className="text-xs text-gray-500 block mt-2 truncate">
          {question.question_id}
        </code>
      </CardContent>
      
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      
      {/* Source handles - positioned based on select options */}
      {hasSelectOptions ? (
        // Multiple handles for select options - positioned to align with each option subcard
        <>
          {(() => {
            let currentOptionIndex = 0;
            return selectPlaceholders.map(([placeholderKey, placeholder]) => 
              placeholder.type === 'select' && placeholder.options?.map((option, optIndex) => {
                const handleId = `option-${placeholderKey}-${option.id}`;
                // Calculate position based on the actual rendered position of the option
                // Base position starts after header (80px) + options header (30px) + (optionIndex * 50px for each option)
                const topPosition = 110 + (currentOptionIndex * 50);
                currentOptionIndex++;
                
                return (
                  <Handle
                    key={handleId}
                    type="source"
                    position={Position.Right}
                    id={handleId}
                    className="w-3 h-3 bg-blue-500 border-2 border-white"
                    style={{ 
                      top: `${topPosition}px`,
                      transform: 'translateY(-50%)'
                    }}
                  />
                );
              })
            );
          })()}
        </>
      ) : (
        // Single handle for non-select questions
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-blue-500 border-2 border-white"
        />
      )}
    </Card>
  );
}
