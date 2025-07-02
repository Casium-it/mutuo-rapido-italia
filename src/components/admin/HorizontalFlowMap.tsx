import React, { useMemo } from 'react';
import { Block, Question, Placeholder, SelectPlaceholder } from '@/types/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FileText, Square, ArrowRight, Plus } from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'question' | 'terminal';
  question?: Question;
  terminalType?: 'stop_flow' | 'next_block' | 'add_block';
  terminalLabel?: string;
  column: number;
  row: number;
  connections: FlowConnection[];
}

interface FlowConnection {
  toNodeId: string;
  label?: string;
  type: 'stop_flow' | 'next_block' | 'question' | 'add_block';
  optionLabel?: string;
}

interface HorizontalFlowMapProps {
  block: Block;
  isOpen: boolean;
  onClose: () => void;
}

export function HorizontalFlowMap({ block, isOpen, onClose }: HorizontalFlowMapProps) {
  const { flowNodes, maxColumns, maxRows } = useMemo(() => {
    const nodes: FlowNode[] = [];
    const nodeMap = new Map<string, FlowNode>();
    const terminalNodes = new Map<string, FlowNode>();
    let maxCols = 0;
    let maxRowsInColumn = 0;

    // First pass: Create question nodes
    block.questions.forEach((question, index) => {
      const node: FlowNode = {
        id: question.question_id,
        type: 'question',
        question,
        column: index,
        row: 0,
        connections: []
      };
      nodes.push(node);
      nodeMap.set(question.question_id, node);
      maxCols = Math.max(maxCols, index);
    });

    // Second pass: Analyze connections and create flow structure
    const columnConnections = new Map<number, Set<string>>();
    
    block.questions.forEach((question, questionIndex) => {
      const sourceNode = nodeMap.get(question.question_id);
      if (!sourceNode) return;

      const connections: FlowConnection[] = [];

      // Process placeholders to find connections
      Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
        if (placeholder.type === 'select') {
          const selectPlaceholder = placeholder as SelectPlaceholder;
          selectPlaceholder.options?.forEach((option) => {
            const connection: FlowConnection = {
              toNodeId: option.leads_to,
              label: option.label,
              type: option.leads_to === 'stop_flow' ? 'stop_flow' : 
                    option.leads_to === 'next_block' ? 'next_block' : 'question',
              optionLabel: option.label
            };

            connections.push(connection);

            // Handle terminal nodes
            if (option.leads_to === 'stop_flow' || option.leads_to === 'next_block') {
              const terminalKey = option.leads_to;
              if (!terminalNodes.has(terminalKey)) {
                const terminalNode: FlowNode = {
                  id: terminalKey,
                  type: 'terminal',
                  terminalType: option.leads_to,
                  terminalLabel: option.leads_to === 'stop_flow' ? 'STOP FLOW' : 'NEXT BLOCK',
                  column: maxCols + 1,
                  row: terminalNodes.size,
                  connections: []
                };
                terminalNodes.set(terminalKey, terminalNode);
              }
            }

            // Handle add_block
            if (option.add_block) {
              const addBlockKey = `add-${option.add_block}`;
              if (!terminalNodes.has(addBlockKey)) {
                const addBlockNode: FlowNode = {
                  id: addBlockKey,
                  type: 'terminal',
                  terminalType: 'add_block',
                  terminalLabel: `ADD: ${option.add_block}`,
                  column: maxCols + 2,
                  row: terminalNodes.size,
                  connections: []
                };
                terminalNodes.set(addBlockKey, addBlockNode);
              }
              
              connections.push({
                toNodeId: addBlockKey,
                label: `+ ${option.add_block}`,
                type: 'add_block',
                optionLabel: option.label
              });
            }
          });
        } else {
          // Handle input and MultiBlockManager placeholders
          const leadsTo = (placeholder as any).leads_to;
          if (leadsTo) {
            const connection: FlowConnection = {
              toNodeId: leadsTo,
              type: leadsTo === 'stop_flow' ? 'stop_flow' : 
                    leadsTo === 'next_block' ? 'next_block' : 'question'
            };
            connections.push(connection);
          }
        }
      });

      sourceNode.connections = connections;
    });

    // Add terminal nodes to the main nodes array
    terminalNodes.forEach(node => nodes.push(node));

    // Calculate final grid dimensions
    maxCols = Math.max(maxCols + 3, 1);
    const rowsPerColumn = new Map<number, number>();
    nodes.forEach(node => {
      const currentRows = rowsPerColumn.get(node.column) || 0;
      rowsPerColumn.set(node.column, Math.max(currentRows, node.row + 1));
    });
    maxRowsInColumn = Math.max(...Array.from(rowsPerColumn.values()), 1);

    return { 
      flowNodes: nodes, 
      maxColumns: maxCols, 
      maxRows: maxRowsInColumn 
    };
  }, [block]);

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'stop_flow': return 'stroke-red-500';
      case 'next_block': return 'stroke-yellow-500';
      case 'add_block': return 'stroke-green-500';
      default: return 'stroke-blue-500';
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'stop_flow': return 'border-red-500 bg-red-50';
      case 'next_block': return 'border-yellow-500 bg-yellow-50';
      case 'add_block': return 'border-green-500 bg-green-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const renderQuestionCard = (node: FlowNode) => {
    if (!node.question) return null;

    const selectPlaceholders = Object.entries(node.question.placeholders).filter(
      ([_, placeholder]) => placeholder.type === 'select'
    );

    return (
      <div className={`w-72 bg-white border-2 border-blue-200 rounded-lg shadow-md p-4 ${
        node.connections.length > 1 ? 'border-purple-300' : ''
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <Badge variant="outline" className="text-xs">
            #{node.question.question_number}
          </Badge>
          <span className="text-sm font-medium">Domanda</span>
        </div>
        
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {node.question.question_text.replace(/\{\{[^}]+\}\}/g, '____')}
        </p>

        {selectPlaceholders.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-600">Opzioni:</div>
            {selectPlaceholders.map(([key, placeholder]) => (
              <div key={key} className="space-y-1">
                {placeholder.type === 'select' && placeholder.options?.map((option) => (
                  <div key={option.id} className="text-xs p-2 rounded border border-gray-200 bg-gray-50">
                    <div className="font-medium">{option.label}</div>
                    <div className="flex items-center gap-1 mt-1 text-gray-600">
                      {option.leads_to === 'stop_flow' && <Square className="h-3 w-3 text-red-500" />}
                      {option.leads_to === 'next_block' && <ArrowRight className="h-3 w-3 text-yellow-500" />}
                      {option.leads_to !== 'stop_flow' && option.leads_to !== 'next_block' && <ArrowRight className="h-3 w-3 text-blue-500" />}
                      <code className="text-xs">{option.leads_to}</code>
                      {option.add_block && (
                        <>
                          <Plus className="h-3 w-3 text-green-500 ml-2" />
                          <code className="text-xs text-green-600">{option.add_block}</code>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <code className="text-xs text-gray-500 block mt-2 truncate">
          {node.question.question_id}
        </code>
      </div>
    );
  };

  const renderTerminalCard = (node: FlowNode) => {
    return (
      <div className={`w-48 border-2 rounded-lg shadow-md p-3 ${getNodeColor(node.terminalType || '')}`}>
        <div className="flex items-center gap-2 font-medium text-sm">
          {node.terminalType === 'stop_flow' && <Square className="h-4 w-4 text-red-600" />}
          {node.terminalType === 'next_block' && <ArrowRight className="h-4 w-4 text-yellow-600" />}
          {node.terminalType === 'add_block' && <Plus className="h-4 w-4 text-green-600" />}
          <span>{node.terminalLabel}</span>
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    flowNodes.forEach((sourceNode) => {
      sourceNode.connections.forEach((connection, connIndex) => {
        const targetNode = flowNodes.find(n => n.id === connection.toNodeId);
        if (!targetNode) return;

        const sourceX = sourceNode.column * 320 + 288; // Right edge of source card
        const sourceY = sourceNode.row * 200 + 100; // Middle of source card
        const targetX = targetNode.column * 320; // Left edge of target card
        const targetY = targetNode.row * 200 + 100; // Middle of target card

        // Adjust Y position for multiple connections
        const adjustedSourceY = sourceY + (connIndex * 10) - (sourceNode.connections.length * 5);

        const pathD = `M ${sourceX} ${adjustedSourceY} 
                      L ${sourceX + 20} ${adjustedSourceY} 
                      L ${targetX - 20} ${targetY} 
                      L ${targetX} ${targetY}`;

        connections.push(
          <g key={`${sourceNode.id}-${connection.toNodeId}-${connIndex}`}>
            <path
              d={pathD}
              className={`fill-none stroke-2 ${getConnectionColor(connection.type)}`}
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            {connection.optionLabel && (
              <text
                x={(sourceX + targetX) / 2}
                y={adjustedSourceY - 10}
                className="text-xs fill-gray-600"
                textAnchor="middle"
              >
                {connection.optionLabel}
              </text>
            )}
          </g>
        );
      });
    });

    return connections;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0" hideCloseButton>
        <DialogHeader className="p-4 border-b bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Mappa Flusso - Blocco #{block.block_number}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative overflow-auto bg-gray-50 p-8">
          <div 
            className="relative"
            style={{ 
              width: maxColumns * 320,
              height: Math.max(maxRows * 200, 400)
            }}
          >
            {/* SVG for connections */}
            <svg 
              className="absolute inset-0 pointer-events-none z-10"
              style={{ 
                width: maxColumns * 320,
                height: Math.max(maxRows * 200, 400)
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
                    className="fill-gray-600"
                  />
                </marker>
              </defs>
              {renderConnections()}
            </svg>

            {/* Render nodes */}
            {flowNodes.map((node) => (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: node.column * 320,
                  top: node.row * 200,
                }}
              >
                {node.type === 'question' ? renderQuestionCard(node) : renderTerminalCard(node)}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}