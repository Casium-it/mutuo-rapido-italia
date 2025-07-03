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
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Block, Question, SelectPlaceholder } from '@/types/form';
import { QuestionCard } from './QuestionCard';
import { FlowTerminal } from './FlowTerminal';

const nodeTypes = {
  question: QuestionCard,
  terminal: FlowTerminal,
};

interface QuestionFlowCanvasProps {
  block: Block;
}

export function QuestionFlowCanvas({ block }: QuestionFlowCanvasProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Create a map of question positions for better layout
    const questionPositions = new Map<string, { x: number; y: number }>();
    
    // First pass: create question nodes in a grid layout
    const questionsPerRow = 3;
    const nodeWidth = 320;
    const nodeHeight = 200;
    const horizontalSpacing = 400;
    const verticalSpacing = 300;
    
    block.questions.forEach((question, index) => {
      const row = Math.floor(index / questionsPerRow);
      const col = index % questionsPerRow;
      const x = col * horizontalSpacing;
      const y = row * verticalSpacing;
      
      questionPositions.set(question.question_id, { x, y });
      
      nodes.push({
        id: `question-${question.question_id}`,
        type: 'question',
        position: { x, y },
        data: {
          question,
          questionNumber: index + 1,
        },
      });
    });
    
    // Terminal nodes tracking
    const terminalNodes = new Map<string, { x: number; y: number }>();
    let terminalIndex = 0;
    
    // Second pass: create edges based on question flow
    block.questions.forEach((question) => {
      const sourceNodeId = `question-${question.question_id}`;
      
      // Process all placeholders
      Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
        if (placeholder.type === 'select') {
          const selectPlaceholder = placeholder as SelectPlaceholder;
          // Multiple choice question - create edges for each option
          selectPlaceholder.options.forEach((option, optionIndex) => {
            const edgeId = `${sourceNodeId}-${placeholderKey}-${option.id}`;
            
            if (option.leads_to === 'stop_flow') {
              // Create or reuse STOP terminal
              const terminalId = 'terminal-stop';
              if (!terminalNodes.has(terminalId)) {
                const terminalX = (terminalIndex % 2) * 600;
                const terminalY = Math.max(...Array.from(questionPositions.values()).map(p => p.y)) + 400;
                nodes.push({
                  id: terminalId,
                  type: 'terminal',
                  position: { x: terminalX, y: terminalY },
                  data: { type: 'stop', label: 'FERMA FLUSSO' },
                });
                terminalNodes.set(terminalId, { x: terminalX, y: terminalY });
                terminalIndex++;
              }
              
              edges.push({
                id: edgeId,
                source: sourceNodeId,
                sourceHandle: `option-${optionIndex}`,
                target: terminalId,
                type: 'smoothstep',
                style: { stroke: '#ef4444', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
                label: option.label,
                labelStyle: { fontSize: 12, fontWeight: 500 },
                labelBgStyle: { fill: '#fef2f2', fillOpacity: 0.9 },
              });
            } else if (option.leads_to === 'next_block') {
              // Create or reuse NEXT BLOCK terminal
              const terminalId = 'terminal-next';
              if (!terminalNodes.has(terminalId)) {
                const terminalX = (terminalIndex % 2) * 600;
                const terminalY = Math.max(...Array.from(questionPositions.values()).map(p => p.y)) + 400;
                nodes.push({
                  id: terminalId,
                  type: 'terminal',
                  position: { x: terminalX, y: terminalY },
                  data: { type: 'next', label: 'PROSSIMO BLOCCO' },
                });
                terminalNodes.set(terminalId, { x: terminalX, y: terminalY });
                terminalIndex++;
              }
              
              edges.push({
                id: edgeId,
                source: sourceNodeId,
                sourceHandle: `option-${optionIndex}`,
                target: terminalId,
                type: 'smoothstep',
                style: { stroke: '#eab308', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#eab308' },
                label: option.label,
                labelStyle: { fontSize: 12, fontWeight: 500 },
                labelBgStyle: { fill: '#fefce8', fillOpacity: 0.9 },
              });
            } else if (option.leads_to && questionPositions.has(option.leads_to)) {
              // Connection to another question
              const targetNodeId = `question-${option.leads_to}`;
              edges.push({
                id: edgeId,
                source: sourceNodeId,
                sourceHandle: `option-${optionIndex}`,
                target: targetNodeId,
                targetHandle: 'input',
                type: 'smoothstep',
                style: { stroke: '#6366f1', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
                label: option.label,
                labelStyle: { fontSize: 12, fontWeight: 500 },
                labelBgStyle: { fill: '#f0f0ff', fillOpacity: 0.9 },
              });
            }
            
            // Handle add_block if present
            if (option.add_block) {
              const addBlockTerminalId = `terminal-add-${option.add_block}`;
              if (!terminalNodes.has(addBlockTerminalId)) {
                const terminalX = (terminalIndex % 2) * 600;
                const terminalY = Math.max(...Array.from(questionPositions.values()).map(p => p.y)) + 500;
                nodes.push({
                  id: addBlockTerminalId,
                  type: 'terminal',
                  position: { x: terminalX, y: terminalY },
                  data: { type: 'add', label: `AGGIUNGI: ${option.add_block}` },
                });
                terminalNodes.set(addBlockTerminalId, { x: terminalX, y: terminalY });
                terminalIndex++;
              }
              
              edges.push({
                id: `${edgeId}-add`,
                source: sourceNodeId,
                sourceHandle: `option-${optionIndex}`,
                target: addBlockTerminalId,
                type: 'smoothstep',
                style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#22c55e' },
                label: `+${option.add_block}`,
                labelStyle: { fontSize: 11, fontWeight: 500 },
                labelBgStyle: { fill: '#f0fdf4', fillOpacity: 0.9 },
              });
            }
          });
        } else {
          // Simple input/other placeholder - single connection
          const leadsTo = (placeholder as any).leads_to;
          if (leadsTo) {
            const edgeId = `${sourceNodeId}-${placeholderKey}`;
            
            if (leadsTo === 'stop_flow') {
              const terminalId = 'terminal-stop';
              if (!terminalNodes.has(terminalId)) {
                const terminalX = (terminalIndex % 2) * 600;
                const terminalY = Math.max(...Array.from(questionPositions.values()).map(p => p.y)) + 400;
                nodes.push({
                  id: terminalId,
                  type: 'terminal',
                  position: { x: terminalX, y: terminalY },
                  data: { type: 'stop', label: 'FERMA FLUSSO' },
                });
                terminalNodes.set(terminalId, { x: terminalX, y: terminalY });
                terminalIndex++;
              }
              
              edges.push({
                id: edgeId,
                source: sourceNodeId,
                sourceHandle: 'output',
                target: terminalId,
                type: 'smoothstep',
                style: { stroke: '#ef4444', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
              });
            } else if (leadsTo === 'next_block') {
              const terminalId = 'terminal-next';
              if (!terminalNodes.has(terminalId)) {
                const terminalX = (terminalIndex % 2) * 600;
                const terminalY = Math.max(...Array.from(questionPositions.values()).map(p => p.y)) + 400;
                nodes.push({
                  id: terminalId,
                  type: 'terminal',
                  position: { x: terminalX, y: terminalY },
                  data: { type: 'next', label: 'PROSSIMO BLOCCO' },
                });
                terminalNodes.set(terminalId, { x: terminalX, y: terminalY });
                terminalIndex++;
              }
              
              edges.push({
                id: edgeId,
                source: sourceNodeId,
                sourceHandle: 'output',
                target: terminalId,
                type: 'smoothstep',
                style: { stroke: '#eab308', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#eab308' },
              });
            } else if (questionPositions.has(leadsTo)) {
              const targetNodeId = `question-${leadsTo}`;
              edges.push({
                id: edgeId,
                source: sourceNodeId,
                sourceHandle: 'output',
                target: targetNodeId,
                targetHandle: 'input',
                type: 'smoothstep',
                style: { stroke: '#6366f1', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
              });
            }
          }
        }
      });
    });
    
    return { nodes, edges };
  }, [block]);

  const [flowNodes, , onNodesChange] = useNodesState(nodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(edges);

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />
        <Controls 
          className="bg-white shadow-lg border"
          showInteractive={false}
        />
        <MiniMap 
          nodeStrokeColor="#374151"
          nodeColor="#f9fafb"
          maskColor="rgba(0,0,0,0.1)"
          className="bg-white border shadow-lg"
        />
      </ReactFlow>
    </div>
  );
}