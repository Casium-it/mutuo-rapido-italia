
import { Question } from '@/types/form';

export function calculateNodePositions(questions: Question[], index: number) {
  // Simple grid layout - can be enhanced with more sophisticated algorithms
  const nodesPerRow = 3;
  const nodeWidth = 350;
  const nodeHeight = 200;
  const horizontalSpacing = 100;
  const verticalSpacing = 150;
  
  const row = Math.floor(index / nodesPerRow);
  const col = index % nodesPerRow;
  
  return {
    x: col * (nodeWidth + horizontalSpacing),
    y: row * (nodeHeight + verticalSpacing),
  };
}

export function calculateOptimalLayout(questions: Question[]) {
  // Future enhancement: implement more sophisticated layout algorithms
  // like hierarchical layout based on question dependencies
  return questions.map((_, index) => calculateNodePositions(questions, index));
}
