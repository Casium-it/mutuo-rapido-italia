
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
import { calculateOptimalLayout } from './layoutUtils';

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

    // Calculate optimal positions
    const positions = calculateOptimalLayout(block.questions);

    // Create nodes for each question
    block.questions.forEach((question, index) => {
      const position = positions[index] || { x: 0, y: 0 };
      
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
                  style: { 
                    stroke: '#245C4F', 
                    strokeWidth: 2,
                  },
                  labelStyle: {
                    fontSize: '11px',
                    fontWeight: 500,
                    fill: '#245C4F',
                  },
                  labelBgStyle: {
                    fill: '#ffffff',
                    fillOpacity: 0.9,
                  },
                });
              }
            }
          });
        } else if (placeholder.type === 'input' || placeholder.type === 'MultiBlockManager') {
          // Handle input and MultiBlockManager
          const leadsTo = placeholder.type === 'input' ? placeholder.leads_to : 
                         placeholder.type === 'MultiBlockManager' ? placeholder.leads_to : '';
          if (leadsTo && leadsTo !== 'stop_flow' && leadsTo !== 'next_block') {
            const targetQuestion = block.questions.find(q => q.question_id === leadsTo);
            if (targetQuestion) {
              flowEdges.push({
                id: `${question.question_id}-${placeholderKey}`,
                source: question.question_id,
                target: leadsTo,
                sourceHandle: placeholderKey,
                targetHandle: 'input',
                label: placeholder.placeholder_label || placeholderKey,
                style: { 
                  stroke: '#245C4F', 
                  strokeWidth: 2,
                },
                labelStyle: {
                  fontSize: '11px',
                  fontWeight: 500,
                  fill: '#245C4F',
                },
                labelBgStyle: {
                  fill: '#ffffff',
                  fillOpacity: 0.9,
                },
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
    <div className="h-[700px] w-full border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
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
