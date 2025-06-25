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

const nodeTypes = {
  question: QuestionNode,
  terminal: TerminalNode,
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
    const nodeSpacing = 300;
    
    // Keep track of terminal nodes to avoid duplicates
    const terminalNodes = new Map<string, { x: number; y: number }>();
    
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
      
      // Process placeholders for connections
      Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
        if (placeholder.type === 'select') {
          // Handle select placeholder options
          placeholder.options?.forEach((option, optIndex) => {
            const sourceHandle = `option-${placeholderKey}-${option.id}`;
            
            // Handle leads_to connections
            if (option.leads_to === 'stop_flow') {
              const terminalId = 'terminal-stop-flow';
              if (!terminalNodes.has(terminalId)) {
                const terminalY = yPosition + (terminalNodes.size * 100);
                nodes.push({
                  id: terminalId,
                  type: 'terminal',
                  position: { x: 600, y: terminalY },
                  data: { type: 'stop', label: 'STOP FLOW' },
                });
                terminalNodes.set(terminalId, { x: 600, y: terminalY });
              }
              
              edges.push({
                id: `edge-${questionNodeId}-${sourceHandle}-${terminalId}`,
                source: questionNodeId,
                sourceHandle,
                target: terminalId,
                type: 'smoothstep',
                style: { stroke: '#ef4444' },
              });
            } else if (option.leads_to === 'next_block') {
              const terminalId = 'terminal-next-block';
              if (!terminalNodes.has(terminalId)) {
                const terminalY = yPosition + (terminalNodes.size * 100);
                nodes.push({
                  id: terminalId,
                  type: 'terminal',
                  position: { x: 600, y: terminalY },
                  data: { type: 'next', label: 'NEXT BLOCK' },
                });
                terminalNodes.set(terminalId, { x: 600, y: terminalY });
              }
              
              edges.push({
                id: `edge-${questionNodeId}-${sourceHandle}-${terminalId}`,
                source: questionNodeId,
                sourceHandle,
                target: terminalId,
                type: 'smoothstep',
                style: { stroke: '#eab308' },
              });
            } else if (option.leads_to) {
              // Connection to another question
              const targetQuestion = block.questions.find(q => q.question_id === option.leads_to);
              if (targetQuestion) {
                const targetNodeId = `question-${targetQuestion.question_id}`;
                edges.push({
                  id: `edge-${questionNodeId}-${sourceHandle}-${targetNodeId}`,
                  source: questionNodeId,
                  sourceHandle,
                  target: targetNodeId,
                  type: 'smoothstep',
                  style: { stroke: '#6366f1' },
                });
              }
            }
            
            // Handle add_block connections
            if (option.add_block) {
              const addBlockId = `add-block-${option.add_block}`;
              if (!terminalNodes.has(addBlockId)) {
                const terminalY = yPosition + (terminalNodes.size * 100);
                nodes.push({
                  id: addBlockId,
                  type: 'terminal',
                  position: { x: 800, y: terminalY },
                  data: { type: 'add', label: `ADD BLOCK: ${option.add_block}` },
                });
                terminalNodes.set(addBlockId, { x: 800, y: terminalY });
              }
              
              edges.push({
                id: `edge-${questionNodeId}-${sourceHandle}-${addBlockId}`,
                source: questionNodeId,
                sourceHandle,
                target: addBlockId,
                type: 'smoothstep',
                style: { stroke: '#22c55e' },
              });
            }
          });
        } else {
          // Handle input and MultiBlockManager placeholders
          const leadsTo = (placeholder as any).leads_to;
          
          if (leadsTo === 'stop_flow') {
            const terminalId = 'terminal-stop-flow';
            if (!terminalNodes.has(terminalId)) {
              const terminalY = yPosition + (terminalNodes.size * 100);
              nodes.push({
                id: terminalId,
                type: 'terminal',
                position: { x: 400, y: terminalY },
                data: { type: 'stop', label: 'STOP FLOW' },
              });
              terminalNodes.set(terminalId, { x: 400, y: terminalY });
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
              const terminalY = yPosition + (terminalNodes.size * 100);
              nodes.push({
                id: terminalId,
                type: 'terminal',
                position: { x: 400, y: terminalY },
                data: { type: 'next', label: 'NEXT BLOCK' },
              });
              terminalNodes.set(terminalId, { x: 400, y: terminalY });
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
      <DialogContent className="max-w-6xl h-[90vh] p-0" hideCloseButton>
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
