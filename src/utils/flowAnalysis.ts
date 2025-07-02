import { Question, Block } from "@/types/form";

export interface FlowNode {
  id: string;
  questionId: string;
  questionNumber: string;
  questionText: string;
  type: 'simple' | 'branching' | 'inline' | 'terminal';
  column: number;
  row: number;
  connections: FlowConnection[];
  isInline?: boolean;
}

export interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  type: 'next' | 'option' | 'add_block';
}

export interface FlowGraph {
  nodes: FlowNode[];
  connections: FlowConnection[];
  columns: number;
  maxRowsPerColumn: number;
}

export class FlowAnalyzer {
  static analyzeBlock(block: Block): FlowGraph {
    const nodes: FlowNode[] = [];
    const connections: FlowConnection[] = [];
    const questionMap = new Map<string, Question>();
    
    // Create question map for quick lookup
    block.questions.forEach(q => questionMap.set(q.question_id, q));
    
    // Analyze each question and create nodes
    block.questions.forEach((question, index) => {
      const node = this.createNode(question, index);
      nodes.push(node);
      
      // Analyze connections from this question
      const questionConnections = this.analyzeQuestionConnections(question, block.questions);
      connections.push(...questionConnections);
    });
    
    // Calculate layout positions
    this.calculateLayout(nodes, connections);
    
    return {
      nodes,
      connections,
      columns: Math.max(...nodes.map(n => n.column)) + 1,
      maxRowsPerColumn: Math.max(...Object.values(
        nodes.reduce((acc, node) => {
          acc[node.column] = (acc[node.column] || 0) + 1;
          return acc;
        }, {} as Record<number, number>)
      ))
    };
  }

  private static createNode(question: Question, index: number): FlowNode {
    const placeholders = Object.values(question.placeholders || {});
    const hasMultipleOptions = placeholders.some(p => 
      p.type === 'select' && (p as any).options?.length > 1
    );
    
    let type: FlowNode['type'] = 'simple';
    if (hasMultipleOptions) type = 'branching';
    if (question.inline) type = 'inline';
    
    return {
      id: question.question_id,
      questionId: question.question_id,
      questionNumber: question.question_number,
      questionText: this.truncateText(question.question_text, 60),
      type,
      column: 0, // Will be calculated later
      row: 0,    // Will be calculated later
      connections: [],
      isInline: question.inline
    };
  }

  private static analyzeQuestionConnections(question: Question, allQuestions: Question[]): FlowConnection[] {
    const connections: FlowConnection[] = [];
    
    Object.entries(question.placeholders || {}).forEach(([key, placeholder]) => {
      if (placeholder.type === 'select') {
        const selectPlaceholder = placeholder as any;
        selectPlaceholder.options?.forEach((option: any) => {
          if (option.leads_to && option.leads_to !== 'stop_flow') {
            const targetQuestionId = option.leads_to === 'next_block' 
              ? this.findNextQuestion(question, allQuestions)?.question_id
              : option.leads_to;
              
            if (targetQuestionId) {
              connections.push({
                from: question.question_id,
                to: targetQuestionId,
                label: option.label,
                type: option.add_block ? 'add_block' : 'option'
              });
            }
          }
        });
      } else if (placeholder.type === 'input') {
        const inputPlaceholder = placeholder as any;
        if (inputPlaceholder.leads_to && inputPlaceholder.leads_to !== 'stop_flow') {
          const targetQuestionId = inputPlaceholder.leads_to === 'next_block'
            ? this.findNextQuestion(question, allQuestions)?.question_id
            : inputPlaceholder.leads_to;
            
          if (targetQuestionId) {
            connections.push({
              from: question.question_id,
              to: targetQuestionId,
              label: inputPlaceholder.placeholder_label,
              type: 'next'
            });
          }
        }
      }
    });
    
    return connections;
  }

  private static findNextQuestion(currentQuestion: Question, allQuestions: Question[]): Question | null {
    const currentIndex = allQuestions.findIndex(q => q.question_id === currentQuestion.question_id);
    return currentIndex >= 0 && currentIndex < allQuestions.length - 1 
      ? allQuestions[currentIndex + 1]
      : null;
  }

  private static calculateLayout(nodes: FlowNode[], connections: FlowConnection[]): void {
    // Simple column-based layout algorithm
    const nodeMap = new Map<string, FlowNode>();
    nodes.forEach(node => nodeMap.set(node.id, node));
    
    // Start with first question in column 0
    if (nodes.length > 0) {
      nodes[0].column = 0;
      nodes[0].row = 0;
    }
    
    // Build adjacency map
    const adjacencyMap = new Map<string, string[]>();
    connections.forEach(conn => {
      if (!adjacencyMap.has(conn.from)) {
        adjacencyMap.set(conn.from, []);
      }
      adjacencyMap.get(conn.from)!.push(conn.to);
    });
    
    // Calculate columns using BFS-like approach
    const visited = new Set<string>();
    const queue: { nodeId: string; column: number }[] = [];
    
    if (nodes.length > 0) {
      queue.push({ nodeId: nodes[0].id, column: 0 });
      visited.add(nodes[0].id);
    }
    
    while (queue.length > 0) {
      const { nodeId, column } = queue.shift()!;
      const node = nodeMap.get(nodeId);
      if (!node) continue;
      
      node.column = Math.max(node.column, column);
      
      // Process connected nodes
      const connectedNodes = adjacencyMap.get(nodeId) || [];
      connectedNodes.forEach(connectedId => {
        if (!visited.has(connectedId)) {
          visited.add(connectedId);
          queue.push({ nodeId: connectedId, column: column + 1 });
        } else {
          // Update column if we found a longer path
          const connectedNode = nodeMap.get(connectedId);
          if (connectedNode && connectedNode.column <= column) {
            connectedNode.column = column + 1;
          }
        }
      });
    }
    
    // Calculate rows within each column
    const columnGroups = nodes.reduce((acc, node) => {
      if (!acc[node.column]) acc[node.column] = [];
      acc[node.column].push(node);
      return acc;
    }, {} as Record<number, FlowNode[]>);
    
    Object.values(columnGroups).forEach(columnNodes => {
      columnNodes.forEach((node, index) => {
        node.row = index;
      });
    });
  }

  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}