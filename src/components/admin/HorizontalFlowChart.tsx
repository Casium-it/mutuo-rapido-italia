import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Block } from '@/types/form';
import { FlowAnalyzer, FlowNode, FlowConnection } from '@/utils/flowAnalysis';

interface HorizontalFlowChartProps {
  block: Block;
}

export const HorizontalFlowChart: React.FC<HorizontalFlowChartProps> = ({ block }) => {
  const flowGraph = FlowAnalyzer.analyzeBlock(block);
  
  const getNodeColor = (type: FlowNode['type']) => {
    switch (type) {
      case 'branching': return 'bg-orange-50 border-orange-200';
      case 'inline': return 'bg-blue-50 border-blue-200';
      case 'terminal': return 'bg-gray-50 border-gray-200';
      default: return 'bg-green-50 border-green-200';
    }
  };

  const getNodeIcon = (type: FlowNode['type']) => {
    switch (type) {
      case 'branching': return '🔀';
      case 'inline': return '📝';
      case 'terminal': return '🏁';
      default: return '❓';
    }
  };

  const renderNode = (node: FlowNode) => {
    const connections = flowGraph.connections.filter(c => c.from === node.id);
    
    return (
      <div
        key={node.id}
        className="flex flex-col items-center mb-4"
        style={{
          gridColumn: node.column + 1,
          gridRow: node.row + 1,
        }}
      >
        <Card className={`w-64 ${getNodeColor(node.type)} transition-all hover:shadow-md`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getNodeIcon(node.type)}</span>
              <Badge variant="outline" className="text-xs">
                {node.questionNumber}
              </Badge>
              {node.isInline && (
                <Badge variant="secondary" className="text-xs">
                  Inline
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-tight">
              {node.questionText}
            </p>
            
            {connections.length > 0 && (
              <div className="mt-3 space-y-1">
                {connections.map((connection, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-600 truncate">
                      {connection.label || 'Continua'}
                    </span>
                    {connection.type === 'add_block' && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        +Block
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConnections = () => {
    return flowGraph.connections.map((connection, index) => {
      const fromNode = flowGraph.nodes.find(n => n.id === connection.from);
      const toNode = flowGraph.nodes.find(n => n.id === connection.to);
      
      if (!fromNode || !toNode) return null;
      
      const fromX = (fromNode.column + 1) * 280; // 264px card width + 16px gap
      const fromY = (fromNode.row + 1) * 120 + 60; // Approximate center of card
      const toX = (toNode.column + 1) * 280;
      const toY = (toNode.row + 1) * 120 + 60;
      
      return (
        <line
          key={`${connection.from}-${connection.to}-${index}`}
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="#94a3b8"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
          className="transition-all"
        />
      );
    });
  };

  if (flowGraph.nodes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nessuna domanda trovata in questo blocco
      </div>
    );
  }

  const gridWidth = flowGraph.columns * 280;
  const gridHeight = flowGraph.maxRowsPerColumn * 120;

  return (
    <div className="relative overflow-auto">
      <div 
        className="relative"
        style={{ 
          width: `${gridWidth}px`,
          height: `${gridHeight}px`,
          minWidth: '100%'
        }}
      >
        {/* SVG for connections */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={gridWidth}
          height={gridHeight}
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
          {renderConnections()}
        </svg>
        
        {/* Grid for nodes */}
        <div
          className="grid gap-4 p-4"
          style={{
            gridTemplateColumns: `repeat(${flowGraph.columns}, 264px)`,
            gridTemplateRows: `repeat(${flowGraph.maxRowsPerColumn}, 120px)`,
          }}
        >
          {flowGraph.nodes.map(renderNode)}
        </div>
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
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
            +Block
          </Badge>
          <span className="text-sm text-gray-600">Aggiunge un blocco</span>
        </div>
      </div>
    </div>
  );
};