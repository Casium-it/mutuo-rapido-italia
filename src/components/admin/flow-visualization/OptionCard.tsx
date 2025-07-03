
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { PlaceholderOption } from '@/types/form';

interface OptionCardProps {
  option: PlaceholderOption;
  handleId: string;
  placeholderKey: string;
  index: number;
}

export function OptionCard({ option, handleId, placeholderKey, index }: OptionCardProps) {
  const getFlowLabel = (leadsTo: string) => {
    if (leadsTo === 'stop_flow') return 'STOP FLOW';
    if (leadsTo === 'next_block') return 'NEXT BLOCK';
    return null;
  };

  const flowLabel = getFlowLabel(option.leads_to);
  const isFlowControl = flowLabel !== null;

  const getFlowBadgeVariant = (flowLabel: string | null) => {
    if (flowLabel === 'STOP FLOW') return 'destructive';
    if (flowLabel === 'NEXT BLOCK') return 'secondary';
    return 'outline';
  };

  return (
    <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900 mb-1">
            {option.label}
          </div>
          <div className="flex items-center gap-2 text-xs">
            {flowLabel ? (
              <Badge variant={getFlowBadgeVariant(flowLabel)} className="text-xs">
                {flowLabel}
              </Badge>
            ) : (
              <span className="text-gray-500 bg-white px-2 py-1 rounded border">
                → {option.leads_to}
              </span>
            )}
            {option.add_block && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Plus className="h-2 w-2" />
                {option.add_block}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Handle positioned at the right edge of the card */}
        {!isFlowControl && (
          <Handle
            type="source"
            position={Position.Right}
            id={handleId}
            className="!bg-[#245C4F] !border-[#245C4F] !w-3 !h-3 !right-[-6px]"
          />
        )}
      </div>
    </div>
  );
}
