
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Square, ArrowRight, Plus } from 'lucide-react';

interface HorizontalTerminalNodeProps {
  data: {
    id: string;
    type: 'stop' | 'next' | 'add';
    label: string;
    level: number;
  };
}

export function HorizontalTerminalNode({ data }: HorizontalTerminalNodeProps) {
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
          handle: 'bg-red-500',
        };
      case 'next':
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          icon: 'text-yellow-600',
          handle: 'bg-yellow-500',
        };
      case 'add':
        return {
          border: 'border-green-500',
          bg: 'bg-green-50',
          text: 'text-green-800',
          icon: 'text-green-600',
          handle: 'bg-green-500',
        };
      default:
        return {
          border: 'border-gray-500',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          icon: 'text-gray-600',
          handle: 'bg-gray-500',
        };
    }
  };
  
  const styles = getStyles();
  
  return (
    <Card className={`w-56 border-2 ${styles.border} ${styles.bg} shadow-md`}>
      <CardContent className="p-4">
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
        className={`w-3 h-3 border-2 border-white ${styles.handle} !left-[-6px]`}
      />
    </Card>
  );
}
