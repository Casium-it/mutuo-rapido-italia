
import React, { useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Block } from '@/types/form';
import { FlowAnalysis } from '@/utils/flowAnalysis';
import { HorizontalQuestionNode } from './HorizontalQuestionNode';
import { HorizontalTerminalNode } from './HorizontalTerminalNode';

interface HorizontalFlowChartProps {
  block: Block;
}

const nodeTypes = {
  horizontalQuestion: HorizontalQuestionNode,
  horizontalTerminal: HorizontalTerminalNode,
};

// Layout constants
const CARD_WIDTH = 350;
const LEVEL_WIDTH = 500;
const VERTICAL_SPACING = 60;
const CONTAINER_PADDING = 50;

export function HorizontalFlowChart({ block }: HorizontalFlowChartProps) {
  const { nodes, edges } = useMemo(() => {
    const flowAnalysis = new FlowAnalysis(block.questions);
    const { steps, terminals } = flowAnalysis.analyze();

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create question nodes with horizontal positioning
    let cumulativeHeights = new Map<number, number>(); // Track cumulative height per level
    
    steps.forEach(step => {
      const currentLevelHeight = cumulativeHeights.get(step.level) || 0;
      
      // Horizontal positioning based on level
      const x = CONTAINER_PADDING + step.level * LEVEL_WIDTH;
      
      // Vertical positioning based on cumulative heights and branch index
      const y = currentLevelHeight + (step.branchIndex * VERTICAL_SPACING);
      
      nodes.push({
        id: step.id,
        type: 'horizontalQuestion',
        position: { x, y },
        data: {
          step,
          questionNumber: steps.indexOf(step) + 1,
        },
      });

      // Update cumulative height for this level
      cumulativeHeights.set(step.level, Math.max(currentLevelHeight, y + step.height + VERTICAL_SPACING));
    });

    // Create terminal nodes
    terminals.forEach((terminal, index) => {
      const x = CONTAINER_PADDING + terminal.level * LEVEL_WIDTH;
      const y = index * 120; // Simple vertical spacing for terminals

      nodes.push({
        id: terminal.id,
        type: 'horizontalTerminal',
        position: { x, y },
        data: terminal,
      });
    });

    // Create edges
    steps.forEach(step => {
      step.connections.forEach(conn => {
        const edgeStyle = {
          stroke: conn.type === 'stop' ? '#ef4444' : 
                  conn.type === 'next' ? '#eab308' : 
                  conn.type === 'add' ? '#22c55e' : '#6366f1',
          strokeWidth: 2,
        };

        if (conn.type === 'normal') {
          // Connection to another question
          const targetStep = steps.find(s => s.id === conn.targetId);
          if (targetStep) {
            edges.push({
              id: `edge-${step.id}-${conn.targetId}`,
              source: step.id,
              target: conn.targetId,
              sourceHandle: conn.sourceHandle,
              type: 'smoothstep',
              style: edgeStyle,
              label: conn.label,
              labelStyle: {
                fontSize: '11px',
                fontWeight: 500,
              },
            });
          }
        } else {
          // Connection to terminal
          const terminalId = conn.type === 'add' ? `add-block-${conn.addBlockId}` : `terminal-${conn.targetId}`;
          const terminal = terminals.find(t => t.id === terminalId);
          if (terminal) {
            edges.push({
              id: `edge-${step.id}-${terminalId}`,
              source: step.id,
              target: terminalId,
              sourceHandle: conn.sourceHandle,
              type: 'smoothstep',
              style: edgeStyle,
              label: conn.label,
              labelStyle: {
                fontSize: '11px',
                fontWeight: 500,
              },
            });
          }
        }
      });
    });

    return { nodes, edges };
  }, [block]);

  const [flowNodes, , onNodesChange] = useNodesState(nodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(edges);

  return (
    <div className="h-[700px] w-full border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.1,
          includeHiddenNodes: false,
        }}
        attributionPosition="bottom-left"
        className="bg-gradient-to-br from-gray-50 to-gray-100"
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          color="#e5e7eb" 
          gap={20} 
          size={1}
        />
        <Controls 
          className="bg-white shadow-lg border border-gray-200 rounded-lg"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
      </ReactFlow>
    </div>
  );
}
