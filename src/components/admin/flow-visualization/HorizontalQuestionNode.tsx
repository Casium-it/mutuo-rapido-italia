
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus } from 'lucide-react';
import { FlowStep } from '@/utils/flowAnalysis';

interface HorizontalQuestionNodeProps {
  data: {
    step: FlowStep;
    questionNumber: number;
  };
}

export function HorizontalQuestionNode({ data }: HorizontalQuestionNodeProps) {
  const { step, questionNumber } = data;

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'stop':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'next':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'add':
        return 'text-green-700 bg-green-50 border-green-200';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <Card className="w-[350px] border-2 border-[#245C4F] shadow-lg bg-white">
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!bg-[#245C4F] !border-[#245C4F] !w-4 !h-4 !left-[-8px]"
      />
      
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
          <FileText className="h-4 w-4 text-[#245C4F]" />
          <Badge variant="outline" className="text-xs font-mono">
            #{step.questionNumber}
          </Badge>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {step.questionId}
          </code>
          {step.question.inline && (
            <Badge variant="secondary" className="text-xs">
              Inline
            </Badge>
          )}
          {step.question.endOfForm && (
            <Badge variant="secondary" className="text-xs">
              Fine Form
            </Badge>
          )}
          <Badge variant="outline" className="text-xs capitalize">
            {step.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Question text */}
        <div className="mb-4 p-3 bg-[#245C4F]/5 border border-[#245C4F]/20 rounded-lg">
          <div className="text-sm font-medium text-gray-900 mb-1">Testo della domanda:</div>
          <div className="text-sm text-gray-700">
            {step.questionText.replace(/\{\{[^}]+\}\}/g, '____')}
          </div>
        </div>
        
        {/* Question notes */}
        {step.question.question_notes && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs font-medium text-blue-800 mb-1">Note:</div>
            <div className="text-xs text-blue-700">
              {step.question.question_notes}
            </div>
          </div>
        )}
        
        {/* Connections */}
        {step.connections.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">
              Connessioni ({step.connections.length})
            </div>
            {step.connections.map((connection, index) => (
              <div key={index} className={`p-2 rounded border text-xs ${getConnectionColor(connection.type)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{connection.label}</div>
                    <div className="text-xs opacity-75 mt-1">
                      → {connection.targetId}
                    </div>
                  </div>
                  {connection.addBlockId && (
                    <div className="flex items-center gap-1 ml-2">
                      <Plus className="h-3 w-3" />
                      <code className="text-xs">{connection.addBlockId}</code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Source handles - one for each connection */}
      {step.connections.map((connection, index) => (
        <Handle
          key={connection.sourceHandle || index}
          type="source"
          position={Position.Right}
          id={connection.sourceHandle || `connection-${index}`}
          className="!bg-[#245C4F] !border-[#245C4F] !w-3 !h-3 !right-[-6px]"
          style={{
            top: `${120 + (index * 50)}px`,
            transform: 'translateY(-50%)'
          }}
        />
      ))}
    </Card>
  );
}
