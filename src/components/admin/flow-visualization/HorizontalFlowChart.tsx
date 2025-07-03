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
  
  const getStepColor = (step: FlowStep) => {
    if (step.endOfForm) return 'border-red-500 bg-red-100'; // Red only for end of form
    if (step.type === 'branching') return 'border-green-600 bg-green-100';
    if (step.type === 'inline') return 'border-gray-400 bg-gray-100';
    return 'border-green-400 bg-green-50';
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
    const cardWidth = 350;
    const cardPadding = 40; // Internal card padding (20px each side)
    const availableTextWidth = cardWidth - cardPadding;
    const avgCharWidth = 7; // Average character width in pixels
    const charsPerLine = Math.floor(availableTextWidth / avgCharWidth);
    
    // Helper function to calculate text height with line wrapping
    const calculateTextHeight = (text: string, lineHeight: number = 20, extraPadding: number = 0): number => {
      const lines = Math.ceil(text.length / charsPerLine);
      return (lines * lineHeight) + extraPadding;
    };
    
    // GROUP 1: General Information Section
    let generalInfoHeight = 0;
    
    // Question ID badge
    generalInfoHeight += 35;
    
    // Inline status
    generalInfoHeight += 25;
    
    // Question text (with proper line wrapping)
    generalInfoHeight += calculateTextHeight(step.questionText, 20, 30);
    
    // Question notes (if present) - blue box
    if (step.questionNotes) {
      generalInfoHeight += calculateTextHeight(step.questionNotes, 16, 50); // Box padding + border
    }
    
    // Question attributes (3 lines: endOfForm, skippableWithNotSure, priority)
    generalInfoHeight += 75; // Fixed height for 3 attribute lines
    
    // GROUP 2: Placeholders Section
    let placeholdersTotalHeight = 0;
    
    // Placeholders header
    if (step.placeholderDetails.length > 0) {
      placeholdersTotalHeight += 35; // "Placeholders (X)" header
    }
    
    // Calculate each placeholder group individually
    step.placeholderDetails.forEach(placeholder => {
      let placeholderGroupHeight = 0;
      
      // Placeholder container border + padding
      placeholderGroupHeight += 30;
      
      // Badges line (key + type)
      placeholderGroupHeight += 25;
      
      if (placeholder.type === 'select') {
        // Multiple line
        placeholderGroupHeight += 20;
        
        // Label line
        placeholderGroupHeight += 20;
        
        // Options header
        placeholderGroupHeight += 20;
        
        // Each option with dynamic height calculation
        placeholder.options?.forEach(option => {
          // Option label line
          placeholderGroupHeight += calculateTextHeight(option.label, 20, 5);
          
          // ID line with target (this can wrap!)
          const idText = `ID: ${option.id} → ${option.leads_to}`;
          placeholderGroupHeight += calculateTextHeight(idText, 20, 5);
          
          // Add block line (if present)
          if (option.add_block) {
            const blockText = `+ Block: ${option.add_block}`;
            placeholderGroupHeight += calculateTextHeight(blockText, 20, 5);
          }
          
          // Spacing between options
          placeholderGroupHeight += 10;
        });
        
      } else if (placeholder.type === 'input') {
        // Input type line
        const inputTypeText = `Input Type: ${placeholder.input_type}`;
        placeholderGroupHeight += calculateTextHeight(inputTypeText, 20, 5);
        
        // Label line
        const labelText = `Label: ${placeholder.placeholder_label}`;
        placeholderGroupHeight += calculateTextHeight(labelText, 20, 5);
        
        // Validation line
        const validationText = `Validation: ${placeholder.input_validation}`;
        placeholderGroupHeight += calculateTextHeight(validationText, 20, 5);
        
      } else if (placeholder.type === 'MultiBlockManager') {
        // Label line
        const labelText = `Label: ${placeholder.placeholder_label}`;
        placeholderGroupHeight += calculateTextHeight(labelText, 20, 5);
        
        // Add block label line
        const addBlockLabelText = `Add Block Label: ${placeholder.add_block_label}`;
        placeholderGroupHeight += calculateTextHeight(addBlockLabelText, 20, 5);
        
        // Blueprint line
        const blueprintText = `Blueprint: ${placeholder.blockBlueprint}`;
        placeholderGroupHeight += calculateTextHeight(blueprintText, 20, 5);
      }
      
      // Spacing between placeholder groups
      placeholderGroupHeight += 20;
      
      placeholdersTotalHeight += placeholderGroupHeight;
    });
    
    // Final calculation: General Info + Placeholders + Card Padding + Safety Margin
    const cardInternalPadding = 40;
    const safetyMargin = 30;
    
    return generalInfoHeight + placeholdersTotalHeight + cardInternalPadding + safetyMargin;
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
  
  // Calculate proper height by considering the actual card heights
  const maxY = Math.max(...Object.values(levelPositions).map((positions, levelIndex) => {
    if (positions.length === 0) return 0;
    const lastPosition = Math.max(...positions);
    const lastStepIndex = positions.indexOf(lastPosition);
    const lastStep = flowData.levels[levelIndex]?.steps[lastStepIndex];
    const lastStepHeight = lastStep ? calculateStepHeight(lastStep) : 300;
    return lastPosition + lastStepHeight;
  }));
  
  const totalHeight = maxY + containerPadding * 2; // Add padding at top and bottom

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
                  <Card className={`${getStepColor(step)} border-2 transition-all hover:shadow-lg h-full`}>
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
      
    </div>
  );
};
