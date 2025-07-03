
import React, { useEffect, useState, useCallback } from 'react';
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
import { Block, Question } from '@/types/form';
import { QuestionNode } from './QuestionNode';
import { calculateNodePositions } from './layoutUtils';

interface FlowVisualizationProps {
  block: Block;
}

const nodeTypes = {
  question: QuestionNode,
};

export function FlowVisualization({ block }: FlowVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const createFlowData = useCallback((block: Block) => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // Create nodes for each question
    block.questions.forEach((question, index) => {
      const position = calculateNodePositions(block.questions, index);
      
      flowNodes.push({
        id: question.question_id,
        type: 'question',
        position,
        data: {
          question,
          blockId: block.block_id,
        },
      });
    });

    // Create edges based on question flows
    block.questions.forEach((question) => {
      Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
        if (placeholder.type === 'select' && placeholder.options) {
          // Handle select options
          placeholder.options.forEach((option, optionIndex) => {
            if (option.leads_to && option.leads_to !== 'stop_flow' && option.leads_to !== 'next_block') {
              // Find target question
              const targetQuestion = block.questions.find(q => q.question_id === option.leads_to);
              if (targetQuestion) {
                flowEdges.push({
                  id: `${question.question_id}-${placeholderKey}-${optionIndex}`,
                  source: question.question_id,
                  target: option.leads_to,
                  sourceHandle: `${placeholderKey}-${optionIndex}`,
                  targetHandle: 'input',
                  label: option.label,
                  style: { stroke: '#245C4F', strokeWidth: 2 },
                });
              }
            }
          });
        } else if (placeholder.type === 'input' || placeholder.type === 'MultiBlockManager') {
          // Handle input and MultiBlockManager
          if (placeholder.leads_to && placeholder.leads_to !== 'stop_flow' && placeholder.leads_to !== 'next_block') {
            const targetQuestion = block.questions.find(q => q.question_id === placeholder.leads_to);
            if (targetQuestion) {
              flowEdges.push({
                id: `${question.question_id}-${placeholderKey}`,
                source: question.question_id,
                target: placeholder.leads_to,
                sourceHandle: placeholderKey,
                targetHandle: 'input',
                style: { stroke: '#245C4F', strokeWidth: 2 },
              });
            }
          }
        }
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, []);

  useEffect(() => {
    const { nodes: flowNodes, edges: flowEdges } = createFlowData(block);
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [block, createFlowData, setNodes, setEdges]);

  return (
    <div className="h-[600px] w-full border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-50"
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
