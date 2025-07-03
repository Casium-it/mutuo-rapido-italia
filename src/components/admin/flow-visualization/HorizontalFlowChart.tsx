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
      case 'branching': return 'border-green-600 bg-green-100';
      case 'inline': return 'border-gray-400 bg-gray-100';
      case 'terminal': return 'border-red-500 bg-red-100';
      default: return 'border-green-400 bg-green-50';
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
      case 'stop': return 'text-red-600 bg-red-100';
      default: return 'text-green-800 bg-green-100';
    }
  };

  const getNextBlockColor = (targetId: string) => {
    if (targetId === 'next_block') {
      return 'text-orange-800 bg-orange-100';
    }
    return 'text-green-800 bg-green-100';
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
    const questionIdHeight = 25; // Line 1: Question ID
    const inlineStatusHeight = 20; // Line 2: inline status
    
    // More accurate question text height calculation based on card width (350px)
    // Assuming ~40 characters per line at card width, with minimum 2 lines
    const estimatedCharsPerLine = 40;
    const questionTextLines = Math.max(2, Math.ceil(step.questionText.length / estimatedCharsPerLine));
    const questionTextHeight = questionTextLines * 22; // 22px per line with spacing
    
    // Question notes height (if present)
    const questionNotesHeight = step.questionNotes ? Math.ceil(step.questionNotes.length / estimatedCharsPerLine) * 18 + 25 : 0;
    
    // Question attributes height (endOfForm, skippable, priority)
    const questionAttributesHeight = 60; // 3 lines for the new attributes
    
    // Calculate placeholder section height dynamically
    let placeholderSectionHeight = 0;
    step.placeholderDetails.forEach(placeholder => {
      if (placeholder.type === 'select') {
        placeholderSectionHeight += 40; // Header + multiple + label
        placeholderSectionHeight += placeholder.options.length * 35; // Each option + id
      } else if (placeholder.type === 'input') {
        placeholderSectionHeight += 60; // input_type + label + validation
      } else if (placeholder.type === 'MultiBlockManager') {
        placeholderSectionHeight += 60; // label + add_block_label + blueprint
      }
      placeholderSectionHeight += 15; // Spacing between placeholders
    });
    
    const optionsHeaderHeight = step.connections.length > 0 ? 35 : 0; // "OPZIONI:" header with padding
    
    // Dynamic option height calculation - accounts for text wrapping
    let totalOptionsHeight = 0;
    step.connections.forEach(connection => {
      // Estimate lines needed for each option label (assuming ~25 chars per line in option context)
      const optionCharsPerLine = 25;
      const optionLines = Math.max(1, Math.ceil(connection.label.length / optionCharsPerLine));
      const baseOptionHeight = 50; // Base height for single line
      const extraHeightPerLine = 20; // Additional height per extra line
      const optionHeight = baseOptionHeight + ((optionLines - 1) * extraHeightPerLine);
      totalOptionsHeight += optionHeight;
    });
    
    // ADD BLOCK elements height
    const addBlockCount = step.connections.filter(conn => 
      conn.type === 'add_block' && conn.addBlockName
    ).length;
    const addBlockHeight = 45; // Height for ADD BLOCK elements
    const totalAddBlockHeight = addBlockCount * addBlockHeight;
    
    const cardPadding = 50; // Increased padding for safety
    const borderSpacing = 30; // Increased spacing
    
    return questionIdHeight + inlineStatusHeight + questionTextHeight + questionNotesHeight + questionAttributesHeight + placeholderSectionHeight + optionsHeaderHeight + totalOptionsHeight + totalAddBlockHeight + cardPadding + borderSpacing;
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
                      {/* Line 1: Question ID only */}
                      <div className="mb-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {step.id}
                        </code>
                      </div>
                      
                      {/* Line 2: Inline status */}
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">
                          inline: {step.isInline ? 'true' : 'false'}
                        </span>
                      </div>
                      
                      {/* Line 3: Question Text */}
                      <p className="text-sm text-gray-800 font-medium mb-3 leading-relaxed flex-shrink-0">
                        {step.questionText}
                      </p>
                      
                      {/* Question Notes */}
                      {step.questionNotes && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                          <div className="text-xs font-medium text-blue-800 mb-1">Note:</div>
                          <div className="text-xs text-blue-700">{step.questionNotes}</div>
                        </div>
                      )}

                      {/* Question Attributes */}
                      <div className="mb-4 space-y-1">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">End of Form:</span>
                          <span className="ml-1">{step.endOfForm ? 'true' : 'false'}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Skippable with Not Sure:</span>
                          <span className="ml-1">{step.skippableWithNotSure ? 'true' : 'false'}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Priority:</span>
                          <span className="ml-1">{step.leadsToPlaceholderPriority}</span>
                        </div>
                      </div>
                      
                      {/* Detailed Placeholders */}
                      {step.placeholderDetails.length > 0 && (
                        <div className="mb-4 space-y-3">
                          <div className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">
                            Placeholders ({step.placeholderDetails.length})
                          </div>
                          {step.placeholderDetails.map((placeholder, idx) => (
                            <div key={idx} className="border border-gray-200 rounded p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {placeholder.key}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {placeholder.type}
                                </Badge>
                              </div>
                              
                              {placeholder.type === 'select' && (
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Multiple:</span>
                                    <span className="ml-1">{placeholder.multiple ? 'true' : 'false'}</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Label:</span>
                                    <span className="ml-1">{placeholder.placeholder_label || 'N/A'}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs font-medium text-gray-700">Options:</div>
                                    {placeholder.options?.map((option, optIdx) => (
                                      <div key={optIdx} className="ml-3 space-y-1">
                                        <div className="text-xs text-gray-700 p-2 bg-gray-50 rounded">
                                          <div className="font-medium">{option.label}</div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            ID: <code className="bg-gray-200 px-1 rounded">{option.id}</code> → 
                                            <Badge className={`ml-1 text-xs ${
                                              option.leads_to === 'next_block' 
                                                ? 'bg-orange-100 text-orange-600'
                                                : option.leads_to === 'stop_flow'
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-green-100 text-green-600'
                                            }`}>
                                              {option.leads_to}
                                            </Badge>
                                          </div>
                                          {option.add_block && (
                                            <div className="text-xs text-blue-600 mt-1">
                                              + Block: {option.add_block}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {placeholder.type === 'input' && (
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Input Type:</span>
                                    <span className="ml-1">{placeholder.input_type}</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Label:</span>
                                    <span className="ml-1">{placeholder.placeholder_label}</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Validation:</span>
                                    <span className="ml-1">{placeholder.input_validation}</span>
                                  </div>
                                </div>
                              )}
                              
                              {placeholder.type === 'MultiBlockManager' && (
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Label:</span>
                                    <span className="ml-1">{placeholder.placeholder_label}</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Add Block Label:</span>
                                    <span className="ml-1">{placeholder.add_block_label}</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <span className="font-medium">Blueprint:</span>
                                    <span className="ml-1">{placeholder.blockBlueprint}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Connections */}
                      {step.connections.length > 0 && (
                        <div className="flex-1 flex flex-col">
                          <div className="border-t pt-3 flex-1">
                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2 block">
                              Opzioni:
                            </span>
                            <div className="space-y-2">
                              {step.connections.map((connection, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    <span className="text-xs text-gray-700 font-medium flex-1">
                                      {connection.label}
                                    </span>
                                    <Badge className={`text-xs font-medium ${
                                      connection.targetId === 'next_block' 
                                        ? getNextBlockColor(connection.targetId)
                                        : connection.targetId === 'stop' 
                                        ? getConnectionColor(connection.type)
                                        : getConnectionColor('default')
                                    }`}>
                                      {connection.targetId === 'next_block' ? 'Next Block' : 
                                       connection.targetId === 'stop' ? 'End' : 
                                       connection.targetId}
                                    </Badge>
                                  </div>
                                  {connection.type === 'add_block' && connection.addBlockName && (
                                    <div className="ml-4 flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                                      <Plus className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                      <span className="text-xs text-blue-700 font-medium">
                                        {connection.addBlockName}
                                      </span>
                                      <Badge className="text-xs bg-blue-100 text-blue-600">
                                        ADD BLOCK
                                      </Badge>
                                    </div>
                                  )}
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
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Legenda</h4>
        
        {/* Icons Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
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

        {/* Card Colors Legend */}
        <div className="border-t pt-3">
          <h5 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Colori delle Card:</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-600 bg-green-100 rounded"></div>
              <span className="text-xs text-gray-600">Domande con opzioni multiple (branching)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-400 bg-green-50 rounded"></div>
              <span className="text-xs text-gray-600">Domande semplici</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 bg-gray-100 rounded"></div>
              <span className="text-xs text-gray-600">Domande inline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-red-500 bg-red-100 rounded"></div>
              <span className="text-xs text-gray-600">Fine del flusso (terminal)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
