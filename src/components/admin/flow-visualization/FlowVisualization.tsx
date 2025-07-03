
import React from 'react';
import { Block } from '@/types/form';
import { EditableFlowChart } from '../flow-editing/EditableFlowChart';
import { FlowEditProvider } from '@/contexts/FlowEditContext';

interface FlowVisualizationProps {
  block: Block;
  onSave?: (block: Block) => Promise<void>;
  isEditing?: boolean;
}

export const FlowVisualization: React.FC<FlowVisualizationProps> = ({
  block,
  onSave = async () => {},
  isEditing = false
}) => {
  return (
    <FlowEditProvider initialBlock={block} onSave={onSave}>
      <EditableFlowChart block={block} isEditing={isEditing} />
    </FlowEditProvider>
  );
};
