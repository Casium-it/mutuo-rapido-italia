import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Block } from '@/types/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { QuestionNode } from './flow-nodes/QuestionNode';
import { TerminalNode } from './flow-nodes/TerminalNode';
import { SelectOptionNode } from './flow-nodes/SelectOptionNode';

const nodeTypes = {
  question: QuestionNode,
  terminal: TerminalNode,
  selectOption: SelectOptionNode,
};

interface BlockFlowMapProps {
  block: Block;
  isOpen: boolean;
  onClose: () => void;
}

export function BlockFlowMap({ block, isOpen, onClose }: BlockFlowMapProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    let yPosition = 0;
    const nodeSpacing = 200;
    const optionSpacing = 150;
    
    // Keep track of terminal nodes to avoid duplicates
    const terminalNodes = new Set<string>();
    
    block.questions.forEach((question, questionIndex) => {
      const questionNodeId = `question-${question.question_id}`;
      
      // Create question node
      nodes.push({
        id: questionNodeId,
        type: 'question',
        position: { x: 0, y: yPosition },
        data: {
          question,
          questionNumber: questionIndex + 1,
        },
      });
      
      // Process placeholders
      Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
        if (placeholder.type === 'select') {
          // Create nodes for each select option
          let optionX = 300;
          
          placeholder.options?.forEach((option, optIndex) => {
            const optionNodeId = `option-${question.question_id}-${placeholderKey}-${option.id}`;
            
            nodes.push({
              id: optionNodeId,
              type: 'selectOption',
              position: { x: optionX, y: yPosition },
              data: {
                option,
                placeholderKey,
              },
            });
            
            // Connect question to option
            edges.push({
              id: `edge-${questionNodeId}-${optionNodeId}`,
              source: questionNodeId,
              target: optionNodeId,
              type: 'smoothstep',
              style: { stroke: '#6366f1' },
            });
            
            // Handle option leads_to
            const leadsTo = option.leads_to;
            if (leadsTo === 'stop_flow') {
              const terminalId = 'terminal-stop-flow';
              if (!terminalNodes.has(terminalId)) {
                nodes.push({
                  id: terminalId,
                  type: 'terminal',
                  position: { x: 600, y: yPosition + (optIndex * 50) },
                  data: { type: 'stop', label: 'STOP FLOW' },
                });
                terminalNodes.add(terminalId);
              }
              
              edges.push({
                id: `edge-${optionNodeId}-${terminalId}`,
                source: optionNodeId,
                target: terminalId,
                type: 'smoothstep',
                style: { stroke: '#ef4444' },
              });
            } else if (leadsTo === 'next_block') {
              const terminalId = 'terminal-next-block';
              if (!terminalNodes.has(terminalId)) {
                nodes.push({
                  id: terminalId,
                  type: 'terminal',
                  position: { x: 600, y: yPosition + (optIndex * 50) },
                  data: { type: 'next', label: 'NEXT BLOCK' },
                });
                terminalNodes.add(terminalId);
              }
              
              edges.push({
                id: `edge-${optionNodeId}-${terminalId}`,
                source: optionNodeId,
                target: terminalId,
                type: 'smoothstep',
                style: { stroke: '#eab308' },
              });
            }
            
            // Handle add_block
            if (option.add_block) {
              const addBlockId = `add-block-${option.add_block}`;
              if (!terminalNodes.has(addBlockId)) {
                nodes.push({
                  id: addBlockId,
                  type: 'terminal',
                  position: { x: 800, y: yPosition + (optIndex * 50) },
                  data: { type: 'add', label: `ADD BLOCK: ${option.add_block}` },
                });
                terminalNodes.add(addBlockId);
              }
              
              edges.push({
                id: `edge-${optionNodeId}-${addBlockId}`,
                source: optionNodeId,
                target: addBlockId,
                type: 'smoothstep',
                style: { stroke: '#22c55e' },
              });
            }
            
            optionX += optionSpacing;
          });
        } else {
          // Handle input and MultiBlockManager placeholders
          const leadsTo = (placeholder as any).leads_to;
          
          if (leadsTo === 'stop_flow') {
            const terminalId = 'terminal-stop-flow';
            if (!terminalNodes.has(terminalId)) {
              nodes.push({
                id: terminalId,
                type: 'terminal',
                position: { x: 400, y: yPosition },
                data: { type: 'stop', label: 'STOP FLOW' },
              });
              terminalNodes.add(terminalId);
            }
            
            edges.push({
              id: `edge-${questionNodeId}-${terminalId}`,
              source: questionNodeId,
              target: terminalId,
              type: 'smoothstep',
              style: { stroke: '#ef4444' },
            });
          } else if (leadsTo === 'next_block') {
            const terminalId = 'terminal-next-block';
            if (!terminalNodes.has(terminalId)) {
              nodes.push({
                id: terminalId,
                type: 'terminal',
                position: { x: 400, y: yPosition },
                data: { type: 'next', label: 'NEXT BLOCK' },
              });
              terminalNodes.add(terminalId);
            }
            
            edges.push({
              id: `edge-${questionNodeId}-${terminalId}`,
              source: questionNodeId,
              target: terminalId,
              type: 'smoothstep',
              style: { stroke: '#eab308' },
            });
          } else if (leadsTo) {
            // Find the target question
            const targetQuestion = block.questions.find(q => q.question_id === leadsTo);
            if (targetQuestion) {
              const targetNodeId = `question-${targetQuestion.question_id}`;
              edges.push({
                id: `edge-${questionNodeId}-${targetNodeId}`,
                source: questionNodeId,
                target: targetNodeId,
                type: 'smoothstep',
                style: { stroke: '#6366f1' },
              });
            }
          }
        }
      });
      
      yPosition += nodeSpacing;
    });
    
    return { nodes, edges };
  }, [block]);

  const [flowNodes, , onNodesChange] = useNodesState(nodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(edges);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Mappa Flusso - Blocco #{block.block_number}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            className="bg-gray-50"
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeStrokeColor="#374151"
              nodeColor="#f3f4f6"
              className="bg-white"
            />
          </ReactFlow>
        </div>
      </DialogContent>
    </Dialog>
  );
}
