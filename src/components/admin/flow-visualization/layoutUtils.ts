
import { Question, Block } from '@/types/form';

interface NodeConnection {
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
}

interface LayoutNode {
  id: string;
  question: Question;
  level: number;
  x: number;
  y: number;
  connections: NodeConnection[];
}

export function calculateNodePositions(questions: Question[], index: number) {
  // Fallback simple grid layout
  const nodesPerRow = 2;
  const nodeWidth = 400;
  const nodeHeight = 300;
  const horizontalSpacing = 150;
  const verticalSpacing = 200;
  
  const row = Math.floor(index / nodesPerRow);
  const col = index % nodesPerRow;
  
  return {
    x: col * (nodeWidth + horizontalSpacing),
    y: row * (nodeHeight + verticalSpacing),
  };
}

export function calculateOptimalLayout(questions: Question[]) {
  if (questions.length === 0) return [];

  // Build connection graph
  const connectionMap = new Map<string, string[]>();
  const reverseConnectionMap = new Map<string, string[]>();
  
  questions.forEach(question => {
    connectionMap.set(question.question_id, []);
    
    Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
      if (placeholder.type === 'select' && placeholder.options) {
        placeholder.options.forEach(option => {
          if (option.leads_to && option.leads_to !== 'stop_flow' && option.leads_to !== 'next_block') {
            // Check if target question exists
            const targetExists = questions.some(q => q.question_id === option.leads_to);
            if (targetExists) {
              connectionMap.get(question.question_id)?.push(option.leads_to);
              if (!reverseConnectionMap.has(option.leads_to)) {
                reverseConnectionMap.set(option.leads_to, []);
              }
              reverseConnectionMap.get(option.leads_to)?.push(question.question_id);
            }
          }
        });
      } else if (placeholder.type === 'input' || placeholder.type === 'MultiBlockManager') {
        const leadsTo = placeholder.leads_to;
        if (leadsTo && leadsTo !== 'stop_flow' && leadsTo !== 'next_block') {
          const targetExists = questions.some(q => q.question_id === leadsTo);
          if (targetExists) {
            connectionMap.get(question.question_id)?.push(leadsTo);
            if (!reverseConnectionMap.has(leadsTo)) {
              reverseConnectionMap.set(leadsTo, []);
            }
            reverseConnectionMap.get(leadsTo)?.push(question.question_id);
          }
        }
      }
    });
  });

  // Find root nodes (nodes with no incoming connections)
  const rootNodes = questions.filter(q => 
    !reverseConnectionMap.has(q.question_id) || 
    reverseConnectionMap.get(q.question_id)?.length === 0
  );

  // If no clear root nodes, use the first question as root
  if (rootNodes.length === 0 && questions.length > 0) {
    rootNodes.push(questions[0]);
  }

  // Assign levels using BFS
  const levels = new Map<string, number>();
  const visited = new Set<string>();
  const queue: { id: string; level: number }[] = [];

  // Start with root nodes at level 0
  rootNodes.forEach(node => {
    levels.set(node.question_id, 0);
    queue.push({ id: node.question_id, level: 0 });
  });

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    
    if (visited.has(id)) continue;
    visited.add(id);

    const connections = connectionMap.get(id) || [];
    connections.forEach(targetId => {
      if (!levels.has(targetId) || levels.get(targetId)! < level + 1) {
        levels.set(targetId, level + 1);
        queue.push({ id: targetId, level: level + 1 });
      }
    });
  }

  // Group questions by level
  const levelGroups = new Map<number, Question[]>();
  questions.forEach(question => {
    const level = levels.get(question.question_id) || 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)?.push(question);
  });

  // Calculate positions
  const positions: { x: number; y: number }[] = [];
  const nodeWidth = 400;
  const nodeHeight = 350;
  const horizontalSpacing = 200;
  const verticalSpacing = 100;

  questions.forEach(question => {
    const level = levels.get(question.question_id) || 0;
    const levelQuestions = levelGroups.get(level) || [];
    const indexInLevel = levelQuestions.indexOf(question);
    const questionsInLevel = levelQuestions.length;

    // Center the questions in each level
    const totalWidth = (questionsInLevel - 1) * (nodeWidth + horizontalSpacing);
    const startX = -totalWidth / 2;
    
    const x = startX + indexInLevel * (nodeWidth + horizontalSpacing);
    const y = level * (nodeHeight + verticalSpacing);

    positions.push({ x, y });
  });

  return positions;
}
