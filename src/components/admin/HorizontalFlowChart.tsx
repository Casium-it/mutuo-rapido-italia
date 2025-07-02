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

  // Calculate dynamic heights for each step
  const calculateStepHeight = (step: FlowStep): number => {
    const headerHeight = 50; // Header with badges
    const questionTextHeight = Math.max(60, Math.ceil(step.questionText.length / 60) * 20); // Estimate based on text length
    const optionsHeaderHeight = step.connections.length > 0 ? 30 : 0; // "OPZIONI:" header
    const optionHeight = 50; // Height per option (including padding and margins)
    const cardPadding = 40; // Card internal padding
    const borderSpacing = 20; // Border and spacing
    
    const totalOptionsHeight = step.connections.length * optionHeight;
    
    return headerHeight + questionTextHeight + optionsHeaderHeight + totalOptionsHeight + cardPadding + borderSpacing;
  };

  // Calculate cumulative positions for each level
  const calculateLevelPositions = () => {
    const levelPositions: { [levelIndex: number]: number[] } = {};
    
    flowData.levels.forEach((level, levelIndex) => {
      levelPositions[levelIndex] = [];
      let currentY = containerPadding;
      
      level.steps.forEach((step, stepIndex) => {
        levelPositions[levelIndex][stepIndex] = currentY;
        const stepHeight = calculateStepHeight(step);
        currentY += stepHeight + verticalSpacing;
      });
    });
    
    return levelPositions;
  };

  const cardWidth = 350; // Width of each card
  const levelWidth = 500; // Width between levels (increased)
  const verticalSpacing = 60; // Vertical spacing between cards (increased by 50%)
  const containerPadding = 50;
  
  const levelPositions = calculateLevelPositions();

  // Calculate total dimensions
  const totalWidth = flowData.levels.length * levelWidth + containerPadding * 2;
  const maxY = Math.max(...Object.values(levelPositions).map(positions => 
    Math.max(...positions) + 300 // Add some extra space for the last card
  ));
  const totalHeight = maxY + containerPadding;

  return (
    <div className="overflow-x-auto overflow-y-auto bg-gray-50 rounded-lg border">
      <div 
        className="relative bg-white"
        style={{ 
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          minWidth: '100%',
          minHeight: '400px'
        }}
      >
        {/* Render questions by level */}
        {flowData.levels.map((level, levelIndex) => (
          <div 
            key={levelIndex} 
            className="absolute"
            style={{ 
              left: `${containerPadding + levelIndex * levelWidth}px`,
              top: containerPadding
            }}
          >
            {level.steps.map((step, stepIndex) => {
              const stepHeight = calculateStepHeight(step);
              const yPosition = levelPositions[levelIndex][stepIndex] - containerPadding;
              
              return (
                <div
                  key={step.id}
                  className="absolute"
                  style={{
                    top: `${yPosition}px`,
                    width: `${cardWidth}px`,
                    height: `${stepHeight}px`
                  }}
                >
                  <Card className={`${getStepColor(step.type)} border-2 transition-all hover:shadow-lg h-full`}>
                    <CardContent className="p-5 h-full flex flex-col">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">{getStepIcon(step.type)}</span>
                        <Badge variant="outline" className="text-xs font-mono font-bold">
                          {step.questionNumber}
                        </Badge>
                        {step.isInline && (
                          <Badge variant="secondary" className="text-xs">
                            Inline
                          </Badge>
                        )}
                      </div>
                      
                      {/* Question Text */}
                      <p className="text-sm text-gray-800 font-medium mb-4 leading-relaxed min-h-[3rem] flex-shrink-0">
                        {step.questionText}
                      </p>
                      
                      {/* Connections */}
                      {step.connections.length > 0 && (
                        <div className="flex-1 flex flex-col">
                          <div className="border-t pt-3 flex-1">
                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2 block">
                              Opzioni:
                            </span>
                            <div className="space-y-2">
                              {step.connections.map((connection, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  <span className="text-xs text-gray-700 font-medium flex-1">
                                    {connection.label}
                                  </span>
                                  <Badge className={`text-xs font-medium ${getConnectionColor(connection.type)}`}>
                                    {connection.type === 'add_block' && <Plus className="w-3 h-3 mr-1" />}
                                    {connection.targetId === 'next_block' ? 'Next Block' : 
                                     connection.targetId === 'stop' ? 'End' : 
                                     connection.targetId}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        ))}

        {/* Render connection arrows */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          width={totalWidth}
          height={totalHeight}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="8"
              refX="10"
              refY="4"
              orient="auto"
            >
              <polygon
                points="0 0, 12 4, 0 8"
                fill="#3b82f6"
              />
            </marker>
          </defs>
          
          {flowData.connections.map((connection, index) => {
            const fromX = containerPadding + (connection.fromLevel * levelWidth) + cardWidth; // End of source card
            const fromY = levelPositions[connection.fromLevel][connection.fromIndex] + (calculateStepHeight(flowData.levels[connection.fromLevel].steps[connection.fromIndex]) / 2); // Middle of source card
            const toX = containerPadding + connection.toLevel * levelWidth; // Start of target card
            const toY = levelPositions[connection.toLevel][connection.toIndex] + (calculateStepHeight(flowData.levels[connection.toLevel].steps[connection.toIndex]) / 2); // Middle of target card
            
            // Calculate control points for curved line
            const midX = fromX + (toX - fromX) / 2;
            const controlX1 = fromX + 60;
            const controlX2 = toX - 60;
            
            return (
              <g key={index}>
                {/* Connection path with curve */}
                <path
                  d={`M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX} ${toY}`}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  className="drop-shadow-sm"
                />
                
                {/* Connection label background */}
                <rect
                  x={midX - 40}
                  y={fromY + (toY - fromY) / 2 - 12}
                  width="80"
                  height="16"
                  fill="white"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  rx="8"
                  className="drop-shadow-sm"
                />
                
                {/* Connection label */}
                <text
                  x={midX}
                  y={fromY + (toY - fromY) / 2 - 2}
                  fill="#374151"
                  fontSize="10"
                  textAnchor="middle"
                  className="font-semibold"
                >
                  {connection.label.length > 12 ? connection.label.substring(0, 12) + "..." : connection.label}
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