import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Block } from '@/types/form';
import { FlowAnalyzer, FlowStep } from '@/utils/flowAnalysis';
import { Plus } from 'lucide-react';

interface HorizontalFlowChartProps {
  block: Block;
}

export const HorizontalFlowChart: React.FC<HorizontalFlowChartProps> = ({ block }) => {
  const flowData = FlowAnalyzer.analyzeBlock(block);
  
  const getStepColor = (type: FlowStep['type']) => {
    switch (type) {
      case 'branching': return 'border-orange-200 bg-orange-50';
      case 'inline': return 'border-blue-200 bg-blue-50';
      case 'terminal': return 'border-gray-200 bg-gray-50';
      default: return 'border-green-200 bg-green-50';
    }
  };

  const getStepIcon = (type: FlowStep['type']) => {
    switch (type) {
      case 'branching': return '🔀';
      case 'inline': return '📝';
      case 'terminal': return '🏁';
      default: return '❓';
    }
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'add_block': return 'text-orange-600 bg-orange-100';
      case 'stop': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (flowData.levels.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nessuna domanda trovata in questo blocco
      </div>
    );
  }

  const cardHeight = 200; // Height of each card
  const levelWidth = 400; // Width between levels
  const connectionGap = 50; // Gap for connections

  return (
    <div className="overflow-x-auto relative">
      <div className="relative p-8" style={{ minWidth: `${flowData.levels.length * levelWidth}px` }}>
        {/* Render questions by level */}
        {flowData.levels.map((level, levelIndex) => (
          <div 
            key={levelIndex} 
            className="absolute"
            style={{ 
              left: `${levelIndex * levelWidth}px`,
              top: 0
            }}
          >
            {level.steps.map((step, stepIndex) => (
              <div
                key={step.id}
                className="absolute"
                style={{
                  top: `${stepIndex * (cardHeight + 40)}px`,
                  width: '320px'
                }}
              >
                <Card className={`${getStepColor(step.type)} border transition-all hover:shadow-md`}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{getStepIcon(step.type)}</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {step.questionNumber}
                      </Badge>
                      {step.isInline && (
                        <Badge variant="secondary" className="text-xs">
                          Inline
                        </Badge>
                      )}
                    </div>
                    
                    {/* Question Text */}
                    <p className="text-sm text-gray-800 font-medium mb-3 leading-relaxed">
                      {step.questionText}
                    </p>
                    
                    {/* Connections */}
                    {step.connections.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs text-gray-500 font-medium">Opzioni:</span>
                        {step.connections.map((connection, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                            <span className="text-xs text-gray-700 truncate flex-1">
                              {connection.label}
                            </span>
                            <Badge className={`text-xs ${getConnectionColor(connection.type)}`}>
                              {connection.type === 'add_block' && <Plus className="w-3 h-3 mr-1" />}
                              {connection.targetId === 'next_block' ? 'Next Block' : 
                               connection.targetId === 'stop' ? 'End' : 
                               connection.targetId}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ))}

        {/* Render connection arrows */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            width: `${flowData.levels.length * levelWidth}px`,
            height: `${Math.max(...flowData.levels.map(l => l.steps.length)) * (cardHeight + 40)}px`
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#94a3b8"
              />
            </marker>
          </defs>
          
          {flowData.connections.map((connection, index) => {
            const fromX = (connection.fromLevel * levelWidth) + 320; // End of source card
            const fromY = (connection.fromIndex * (cardHeight + 40)) + (cardHeight / 2); // Middle of source card
            const toX = connection.toLevel * levelWidth; // Start of target card
            const toY = (connection.toIndex * (cardHeight + 40)) + (cardHeight / 2); // Middle of target card
            
            return (
              <g key={index}>
                {/* Connection line */}
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                
                {/* Connection label */}
                <text
                  x={fromX + (toX - fromX) / 2}
                  y={fromY + (toY - fromY) / 2 - 5}
                  fill="#6b7280"
                  fontSize="11"
                  textAnchor="middle"
                  className="font-medium"
                >
                  {connection.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center border-t pt-4">
        <div className="flex items-center gap-2">
          <span>🔀</span>
          <span className="text-sm text-gray-600">Domanda con opzioni multiple</span>
        </div>
        <div className="flex items-center gap-2">
          <span>❓</span>
          <span className="text-sm text-gray-600">Domanda semplice</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📝</span>
          <span className="text-sm text-gray-600">Domanda inline</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🏁</span>
          <span className="text-sm text-gray-600">Fine flusso</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="text-xs bg-orange-100 text-orange-600">
            <Plus className="w-3 h-3 mr-1" />
            Block
          </Badge>
          <span className="text-sm text-gray-600">Aggiunge un blocco</span>
        </div>
      </div>
    </div>
  );
};