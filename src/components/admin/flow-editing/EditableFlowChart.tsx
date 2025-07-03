import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Block } from '@/types/form';
import { FlowAnalyzer, FlowStep } from '@/utils/flowAnalysis';
import { Plus, Edit2, Settings } from 'lucide-react';
import { QuestionEditDialog } from './QuestionEditDialog';
import { PlaceholderEditDialog } from './PlaceholderEditDialog';
import { OptionEditDialog } from './OptionEditDialog';
import { useFlowEdit } from '@/contexts/FlowEditContext';

interface EditableFlowChartProps {
  block: Block;
}

export const EditableFlowChart: React.FC<EditableFlowChartProps> = ({ block }) => {
  const { state } = useFlowEdit();
  const [questionEditDialog, setQuestionEditDialog] = useState<{ open: boolean; questionId: string | null }>({
    open: false,
    questionId: null
  });
  const [placeholderEditDialog, setPlaceholderEditDialog] = useState<{
    open: boolean;
    questionId: string | null;
    placeholderKey: string | null;
  }>({ open: false, questionId: null, placeholderKey: null });
  const [optionEditDialog, setOptionEditDialog] = useState<{
    open: boolean;
    questionId: string | null;
    placeholderKey: string | null;
    optionIndex: number | null;
  }>({ open: false, questionId: null, placeholderKey: null, optionIndex: null });

  // Use the current block data from edit state
  const currentBlock = state.blockData;
  const flowData = FlowAnalyzer.analyzeBlock(currentBlock);
  
  const getStepColor = (step: FlowStep) => {
    if (step.endOfForm) return 'border-red-500 bg-red-100 hover:bg-red-200'; // Red only for end of form
    if (step.type === 'branching') return 'border-green-600 bg-green-100 hover:bg-green-200';
    if (step.type === 'inline') return 'border-gray-400 bg-gray-100 hover:bg-gray-200';
    return 'border-green-400 bg-green-50 hover:bg-green-100';
  };

  const handleQuestionClick = (questionId: string) => {
    setQuestionEditDialog({ open: true, questionId });
  };

  const handlePlaceholderClick = (questionId: string, placeholderKey: string) => {
    setPlaceholderEditDialog({ open: true, questionId, placeholderKey });
  };

  const handleOptionClick = (questionId: string, placeholderKey: string, optionIndex: number) => {
    setOptionEditDialog({ open: true, questionId, placeholderKey, optionIndex });
  };

  const getSelectedQuestion = () => {
    if (!questionEditDialog.questionId) return null;
    return currentBlock.questions.find(q => q.question_id === questionEditDialog.questionId) || null;
  };

  const getSelectedPlaceholder = () => {
    if (!placeholderEditDialog.questionId || !placeholderEditDialog.placeholderKey) return null;
    const question = currentBlock.questions.find(q => q.question_id === placeholderEditDialog.questionId);
    return question?.placeholders[placeholderEditDialog.placeholderKey] || null;
  };

  const getSelectedOption = () => {
    if (!optionEditDialog.questionId || !optionEditDialog.placeholderKey || optionEditDialog.optionIndex === null) return null;
    const question = currentBlock.questions.find(q => q.question_id === optionEditDialog.questionId);
    const placeholder = question?.placeholders[optionEditDialog.placeholderKey];
    if (placeholder && placeholder.type === 'select') {
      return placeholder.options?.[optionEditDialog.optionIndex] || null;
    }
    return null;
  };

  if (flowData.levels.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nessuna domanda trovata in questo blocco
      </div>
    );
  }

  const calculateStepHeight = (step: FlowStep): number => {
    const cardWidth = 350;
    const cardPadding = 40;
    const availableTextWidth = cardWidth - cardPadding;
    const avgCharWidth = 7;
    const charsPerLine = Math.floor(availableTextWidth / avgCharWidth);
    
    const calculateTextHeight = (text: string, lineHeight: number = 20, extraPadding: number = 0): number => {
      const lines = Math.ceil(text.length / charsPerLine);
      return (lines * lineHeight) + extraPadding;
    };
    
    let generalInfoHeight = 0;
    generalInfoHeight += 35; // Question ID badge
    generalInfoHeight += 25; // Inline status
    generalInfoHeight += calculateTextHeight(step.questionText, 20, 30);
    
    if (step.questionNotes) {
      generalInfoHeight += calculateTextHeight(step.questionNotes, 16, 50);
    }
    
    generalInfoHeight += 75; // Question attributes
    
    let placeholdersTotalHeight = 0;
    
    if (step.placeholderDetails.length > 0) {
      placeholdersTotalHeight += 35;
    }
    
    step.placeholderDetails.forEach(placeholder => {
      let placeholderGroupHeight = 30 + 25; // Container + badges
      
      if (placeholder.type === 'select') {
        placeholderGroupHeight += 20 + 20 + 20; // Multiple, label, options header
        placeholder.options?.forEach(option => {
          placeholderGroupHeight += calculateTextHeight(option.label, 20, 5);
          const idText = `ID: ${option.id} → ${option.leads_to}`;
          placeholderGroupHeight += calculateTextHeight(idText, 20, 5);
          if (option.add_block) {
            const blockText = `+ Block: ${option.add_block}`;
            placeholderGroupHeight += calculateTextHeight(blockText, 20, 5);
          }
          placeholderGroupHeight += 10;
        });
      } else if (placeholder.type === 'input') {
        const inputTypeText = `Input Type: ${placeholder.input_type}`;
        placeholderGroupHeight += calculateTextHeight(inputTypeText, 20, 5);
        const labelText = `Label: ${placeholder.placeholder_label}`;
        placeholderGroupHeight += calculateTextHeight(labelText, 20, 5);
        const validationText = `Validation: ${placeholder.input_validation}`;
        placeholderGroupHeight += calculateTextHeight(validationText, 20, 5);
      } else if (placeholder.type === 'MultiBlockManager') {
        const labelText = `Label: ${placeholder.placeholder_label}`;
        placeholderGroupHeight += calculateTextHeight(labelText, 20, 5);
        const addBlockLabelText = `Add Block Label: ${placeholder.add_block_label}`;
        placeholderGroupHeight += calculateTextHeight(addBlockLabelText, 20, 5);
        const blueprintText = `Blueprint: ${placeholder.blockBlueprint}`;
        placeholderGroupHeight += calculateTextHeight(blueprintText, 20, 5);
      }
      
      placeholderGroupHeight += 20;
      placeholdersTotalHeight += placeholderGroupHeight;
    });
    
    const cardInternalPadding = 40;
    const safetyMargin = 30;
    
    return generalInfoHeight + placeholdersTotalHeight + cardInternalPadding + safetyMargin;
  };

  const calculateLevelPositions = () => {
    const levelPositions: { [levelIndex: number]: number[] } = {};
    const containerPadding = 50;
    const verticalSpacing = 60;
    
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

  const cardWidth = 350;
  const levelWidth = 500;
  const verticalSpacing = 60;
  const containerPadding = 50;
  
  const levelPositions = calculateLevelPositions();

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
    <>
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
                    <Card 
                      className={`${getStepColor(step)} border-2 transition-all hover:shadow-lg h-full cursor-pointer group`}
                      onClick={() => handleQuestionClick(step.id)}
                    >
                      <CardContent className="p-5 h-full flex flex-col relative">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </div>

                        <div className="mb-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {step.id}
                          </code>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-sm text-gray-600">
                            inline: {step.isInline ? 'true' : 'false'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-800 font-medium mb-3 leading-relaxed flex-shrink-0">
                          {step.questionText}
                        </p>
                        
                        {step.questionNotes && (
                          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                            <div className="text-xs font-medium text-blue-800 mb-1">Note:</div>
                            <div className="text-xs text-blue-700">{step.questionNotes}</div>
                          </div>
                        )}

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
                        
                        {step.placeholderDetails.length > 0 && (
                          <div className="mb-4 space-y-3">
                            <div className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">
                              Placeholders ({step.placeholderDetails.length})
                            </div>
                            {step.placeholderDetails.map((placeholder, idx) => (
                              <div 
                                key={idx} 
                                className="border border-gray-200 rounded p-3 space-y-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlaceholderClick(step.id, placeholder.key);
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {placeholder.key}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {placeholder.type}
                                  </Badge>
                                  <Settings className="h-3 w-3 text-gray-400 ml-auto" />
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
                                        <div 
                                          key={optIdx} 
                                          className="ml-3 space-y-1 hover:bg-blue-50 p-2 rounded cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOptionClick(step.id, placeholder.key, optIdx);
                                          }}
                                        >
                                          <div className="text-xs text-gray-700">
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                              ID: <code className="bg-gray-200 px-1 rounded">{option.id}</code> → 
                                              <Badge className={`text-xs ${
                                                option.leads_to === 'next_block' 
                                                  ? 'bg-orange-100 text-orange-600'
                                                  : option.leads_to === 'stop_flow'
                                                  ? 'bg-red-100 text-red-600'
                                                  : 'bg-green-100 text-green-600'
                                              }`}>
                                                {option.leads_to}
                                              </Badge>
                                              <Edit2 className="h-3 w-3 text-gray-400 ml-auto" />
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
              const fromX = containerPadding + (connection.fromLevel * levelWidth) + cardWidth;
              const fromY = levelPositions[connection.fromLevel][connection.fromIndex] + (calculateStepHeight(flowData.levels[connection.fromLevel].steps[connection.fromIndex]) / 2);
              const toX = containerPadding + connection.toLevel * levelWidth;
              const toY = levelPositions[connection.toLevel][connection.toIndex] + (calculateStepHeight(flowData.levels[connection.toLevel].steps[connection.toIndex]) / 2);
              
              const midX = fromX + (toX - fromX) / 2;
              const controlX1 = fromX + 60;
              const controlX2 = toX - 60;
              
              return (
                <g key={index}>
                  <path
                    d={`M ${fromX} ${fromY} C ${controlX1} ${fromY}, ${controlX2} ${toY}, ${toX} ${toY}`}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="drop-shadow-sm"
                  />
                  
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

      {questionEditDialog.open && getSelectedQuestion() && (
        <QuestionEditDialog
          open={questionEditDialog.open}
          question={getSelectedQuestion()!}
          onClose={() => setQuestionEditDialog({ open: false, questionId: null })}
        />
      )}

      {placeholderEditDialog.open && getSelectedPlaceholder() && (
        <PlaceholderEditDialog
          open={placeholderEditDialog.open}
          placeholder={getSelectedPlaceholder()!}
          placeholderKey={placeholderEditDialog.placeholderKey!}
          questionId={placeholderEditDialog.questionId!}
          onClose={() => setPlaceholderEditDialog({ open: false, questionId: null, placeholderKey: null })}
        />
      )}

      {optionEditDialog.open && getSelectedOption() && (
        <OptionEditDialog
          open={optionEditDialog.open}
          option={getSelectedOption()!}
          optionIndex={optionEditDialog.optionIndex!}
          placeholderKey={optionEditDialog.placeholderKey!}
          questionId={optionEditDialog.questionId!}
          onClose={() => setOptionEditDialog({ open: false, questionId: null, placeholderKey: null, optionIndex: null })}
        />
      )}
    </>
  );
};
