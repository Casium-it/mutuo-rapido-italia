import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Square, ArrowRight, Plus } from 'lucide-react';

interface FlowTerminalProps {
  data: {
    type: 'stop' | 'next' | 'add';
    label: string;
  };
}

export function FlowTerminal({ data }: FlowTerminalProps) {
  const { type, label } = data;
  
  const getIcon = () => {
    switch (type) {
      case 'stop':
        return <Square className="h-5 w-5" />;
      case 'next':
        return <ArrowRight className="h-5 w-5" />;
      case 'add':
        return <Plus className="h-5 w-5" />;
      default:
        return null;
    }
  };
  
  const getStyles = () => {
    switch (type) {
      case 'stop':
        return {
          border: 'border-red-500',
          bg: 'bg-red-50',
          text: 'text-red-800',
          icon: 'text-red-600',
          shadow: 'shadow-red-200',
        };
      case 'next':
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          shadow: 'shadow-yellow-200',
        };
      case 'add':
        return {
          border: 'border-green-500',
          bg: 'bg-green-50',
          text: 'text-green-800',
          icon: 'text-green-600',
          shadow: 'shadow-green-200',
        };
      default:
        return {
          border: 'border-gray-500',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          shadow: 'shadow-gray-200',
        };
    }
  };
  
  const styles = getStyles();
  
  return (
    <>
      <Card className={`w-56 border-2 ${styles.border} ${styles.bg} shadow-lg ${styles.shadow}`}>
        <CardContent className="p-4 text-center">
          <div className={`flex items-center justify-center gap-2 ${styles.text} font-semibold text-sm`}>
            <span className={styles.icon}>
              {getIcon()}
            </span>
            {label}
          </div>
        </CardContent>
      </Card>
      
      {/* Input handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-4 h-4 border-2 border-white shadow-md ${
          type === 'stop' ? 'bg-red-500' :
          type === 'next' ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      />
    </>
  );
}