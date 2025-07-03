
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types/form';
import { Hash, FileText, Blocks, Plus } from 'lucide-react';

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

  const getFlowLabel = (leadsTo: string) => {
    if (leadsTo === 'stop_flow') return 'STOP FLOW';
    if (leadsTo === 'next_block') return 'NEXT BLOCK';
    return null;
  };

  const renderOutputConnectors = () => {
    const connectors: JSX.Element[] = [];
    let connectorIndex = 0;

    Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
      if (placeholder.type === 'select' && placeholder.options) {
        // Render connectors for each select option
        placeholder.options.forEach((option, optionIndex) => {
          const handleId = `${placeholderKey}-${optionIndex}`;
          const flowLabel = getFlowLabel(option.leads_to);
          
          connectors.push(
            <div key={handleId} className="flex items-center gap-2 py-1">
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium">{option.label}:</span>
                {flowLabel ? (
                  <Badge variant="outline" className="text-xs px-1">
                    {flowLabel}
                  </Badge>
                ) : (
                  <span className="text-gray-500">→ {option.leads_to}</span>
                )}
                {option.add_block && (
                  <Badge variant="secondary" className="text-xs px-1 flex items-center gap-1">
                    <Plus className="h-2 w-2" />
                    {option.add_block}
                  </Badge>
                )}
              </div>
              {!flowLabel && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={handleId}
                  style={{
                    background: '#245C4F',
                    width: 8,
                    height: 8,
                    right: -12,
                    top: `${20 + connectorIndex * 25}px`,
                  }}
                />
              )}
            </div>
          );
          connectorIndex++;
        });
      } else {
        // Render single connector for input/MultiBlockManager
        const flowLabel = getFlowLabel(placeholder.leads_to || '');
        
        connectors.push(
          <div key={placeholderKey} className="flex items-center gap-2 py-1">
            <div className="flex items-center gap-1 text-xs">
              {flowLabel ? (
                <Badge variant="outline" className="text-xs px-1">
                  {flowLabel}
                </Badge>
              ) : (
                <span className="text-gray-500">→ {placeholder.leads_to}</span>
              )}
              {placeholder.type === 'MultiBlockManager' && 'add_block_label' in placeholder && (
                <Badge variant="secondary" className="text-xs px-1 flex items-center gap-1">
                  <Plus className="h-2 w-2" />
                  {placeholder.add_block_label}
                </Badge>
              )}
            </div>
            {!flowLabel && (
              <Handle
                type="source"
                position={Position.Right}
                id={placeholderKey}
                style={{
                  background: '#245C4F',
                  width: 8,
                  height: 8,
                  right: -12,
                  top: `${20 + connectorIndex * 25}px`,
                }}
              />
            )}
          </div>
        );
        connectorIndex++;
      }
    });

    return connectors;
  };

  return (
    <Card className="min-w-[300px] max-w-[400px] border-2 border-[#245C4F] shadow-lg">
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          background: '#245C4F',
          width: 10,
          height: 10,
          left: -15,
        }}
      />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            #{question.question_number}
          </Badge>
          <code className="text-xs bg-gray-100 px-1 rounded">
            {question.question_id}
          </code>
          {question.inline && (
            <Badge variant="secondary" className="text-xs">
              Inline
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Question text */}
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
          {question.question_text}
        </div>
        
        {/* Question types */}
        <div className="mb-3 flex flex-wrap gap-1">
          {Object.entries(question.placeholders).map(([key, placeholder]) => (
            <Badge key={key} variant="outline" className="text-xs flex items-center gap-1">
              {getQuestionTypeIcon(placeholder.type)}
              {key} ({placeholder.type})
            </Badge>
          ))}
        </div>
        
        {/* Output connectors */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-600 mb-1">Uscite:</div>
          {renderOutputConnectors()}
        </div>
      </CardContent>
    </Card>
  );
}
