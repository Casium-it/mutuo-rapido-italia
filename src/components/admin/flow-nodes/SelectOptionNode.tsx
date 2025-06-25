
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceholderOption } from '@/types/form';
import { List } from 'lucide-react';

interface SelectOptionNodeProps {
  data: {
    option: PlaceholderOption;
    placeholderKey: string;
  };
}

export function SelectOptionNode({ data }: SelectOptionNodeProps) {
  const { option, placeholderKey } = data;
  
  return (
    <Card className="w-44 border-2 border-purple-200 bg-purple-50 shadow-md">
      <CardContent className="p-3">
        <div className="flex items-start gap-2 mb-2">
          <List className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <Badge variant="outline" className="text-xs mb-1 bg-white">
              {placeholderKey}
            </Badge>
            <p className="text-xs font-medium text-purple-800 line-clamp-2">
              {option.label}
            </p>
          </div>
        </div>
        <code className="text-xs text-purple-600 block truncate">
          {option.id}
        </code>
      </CardContent>
      
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </Card>
  );
}
