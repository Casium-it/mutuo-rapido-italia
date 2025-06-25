
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/types/form';
import { FileText } from 'lucide-react';

interface QuestionNodeProps {
  data: {
    question: Question;
    questionNumber: number;
  };
}

export function QuestionNode({ data }: QuestionNodeProps) {
  const { question, questionNumber } = data;
  
  return (
    <Card className="w-64 border-2 border-blue-200 shadow-md">
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
        <div className="flex gap-1 flex-wrap">
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
        <code className="text-xs text-gray-500 block mt-1 truncate">
          {question.question_id}
        </code>
      </CardContent>
      
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </Card>
  );
}
