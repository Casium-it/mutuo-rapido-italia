
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Plus, Blocks } from 'lucide-react';
import { Placeholder } from '@/types/form';

interface PlaceholderCardProps {
  placeholder: Placeholder;
  placeholderKey: string;
  index: number;
}

export function PlaceholderCard({ placeholder, placeholderKey, index }: PlaceholderCardProps) {
  const getFlowLabel = (leadsTo: string) => {
    if (leadsTo === 'stop_flow') return 'STOP FLOW';
    if (leadsTo === 'next_block') return 'NEXT BLOCK';
    return null;
  };

  const leadsTo = placeholder.type === 'input' ? placeholder.leads_to : 
                 placeholder.type === 'MultiBlockManager' ? placeholder.leads_to : '';
  const flowLabel = leadsTo ? getFlowLabel(leadsTo) : null;
  const isFlowControl = flowLabel !== null;

  const getFlowBadgeVariant = (flowLabel: string | null) => {
    if (flowLabel === 'STOP FLOW') return 'destructive';
    if (flowLabel === 'NEXT BLOCK') return 'secondary';
    return 'outline';
  };

  const getPlaceholderTypeColor = (type: string) => {
    switch (type) {
      case 'input':
        return 'bg-blue-50 border-blue-200';
      case 'MultiBlockManager':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`relative ${getPlaceholderTypeColor(placeholder.type)} border rounded-lg p-3 mb-2`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900 mb-1">
            {placeholder.placeholder_label || placeholderKey}
          </div>
          <div className="flex items-center gap-2 text-xs mb-2">
            <Badge variant="outline" className="text-xs">
              {placeholder.type}
            </Badge>
            {placeholder.type === 'input' && (
              <Badge variant="outline" className="text-xs">
                {placeholder.input_type}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            {flowLabel ? (
              <Badge variant={getFlowBadgeVariant(flowLabel)} className="text-xs">
                {flowLabel}
              </Badge>
            ) : (
              <span className="text-gray-500 bg-white px-2 py-1 rounded border">
                → {leadsTo}
              </span>
            )}
            {placeholder.type === 'MultiBlockManager' && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Plus className="h-2 w-2" />
                {placeholder.add_block_label}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Handle positioned at the right edge of the card */}
        {!isFlowControl && (
          <Handle
            type="source"
            position={Position.Right}
            id={placeholderKey}
            className="!bg-[#245C4F] !border-[#245C4F] !w-3 !h-3 !right-[-6px]"
          />
        )}
      </div>
    </div>
  );
}
