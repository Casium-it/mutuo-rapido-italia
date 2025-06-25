
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Square, ArrowRight, Plus } from 'lucide-react';

interface TerminalNodeProps {
  data: {
    type: 'stop' | 'next' | 'add';
    label: string;
  };
}

export function TerminalNode({ data }: TerminalNodeProps) {
  const { type, label } = data;
  
  const getIcon = () => {
    switch (type) {
      case 'stop':
        return <Square className="h-4 w-4" />;
      case 'next':
        return <ArrowRight className="h-4 w-4" />;
      case 'add':
        return <Plus className="h-4 w-4" />;
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
        };
      case 'next':
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
        };
      case 'add':
        return {
          border: 'border-green-500',
          bg: 'bg-green-50',
          text: 'text-green-800',
          icon: 'text-green-600',
        };
      default:
        return {
          border: 'border-gray-500',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          icon: 'text-gray-600',
        };
    }
  };
  
  const styles = getStyles();
  
  return (
    <Card className={`w-48 border-2 ${styles.border} ${styles.bg} shadow-md`}>
      <CardContent className="p-3">
        <div className={`flex items-center gap-2 ${styles.text} font-medium text-sm`}>
          <span className={styles.icon}>
            {getIcon()}
          </span>
          {label}
        </div>
      </CardContent>
      
      {/* Handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 border-2 border-white ${
          type === 'stop' ? 'bg-red-500' :
          type === 'next' ? 'bg-yellow-500' : 'bg-green-500'
        }`}
      />
    </Card>
  );
}
