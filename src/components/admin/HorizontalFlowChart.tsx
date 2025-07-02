import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Block } from '@/types/form';
import { FlowAnalyzer, FlowStep } from '@/utils/flowAnalysis';
import { ArrowRight, Plus } from 'lucide-react';

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

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 p-6 min-w-max">
        {flowData.levels.map((level, levelIndex) => (
          <div key={levelIndex} className="flex flex-col gap-6">
            {level.steps.map((step, stepIndex) => (
              <div key={step.id} className="flex items-center">
                {/* Question Card */}
                <Card className={`w-80 ${getStepColor(step.type)} border transition-all hover:shadow-md`}>
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
                      {step.branchIndex > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Branch {step.branchIndex + 1}
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
                        <span className="text-xs text-gray-500 font-medium">Leads to:</span>
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
                
                {/* Arrow to next level */}
                {levelIndex < flowData.levels.length - 1 && stepIndex === 0 && (
                  <div className="flex items-center justify-center w-16 h-full">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
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