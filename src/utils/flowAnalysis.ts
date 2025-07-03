
import { Question, Block } from '@/types/form';

export interface FlowConnection {
  targetId: string;
  label: string;
  type: 'normal' | 'stop' | 'next' | 'add';
  sourceHandle?: string;
  addBlockId?: string;
}

export interface FlowStep {
  id: string;
  questionId: string;
  questionText: string;
  questionNumber: string;
  type: 'simple' | 'branching' | 'inline' | 'terminal';
  level: number;
  branchIndex: number;
  connections: FlowConnection[];
  question: Question;
  height: number;
}

export class FlowAnalysis {
  private questions: Question[];
  private steps: Map<string, FlowStep> = new Map();

  constructor(questions: Question[]) {
    this.questions = questions;
  }

  public analyze(): { steps: FlowStep[], terminals: any[] } {
    // Phase 1: Create flow steps
    this.createFlowSteps();
    
    // Phase 2: Assign levels (horizontal positioning)
    this.assignLevels();
    
    // Phase 3: Calculate branch indices (vertical positioning)
    this.calculateBranchIndices();
    
    // Phase 4: Calculate dynamic heights
    this.calculateHeights();

    const steps = Array.from(this.steps.values());
    const terminals = this.extractTerminals(steps);
    
    return { steps, terminals };
  }

  private createFlowSteps(): void {
    this.questions.forEach(question => {
      const connections = this.getQuestionConnections(question);
      
      let type: FlowStep['type'] = 'simple';
      if (connections.length > 1) type = 'branching';
      if (question.inline) type = 'inline';
      if (connections.length === 0 || connections.some(c => c.type === 'stop')) type = 'terminal';

      const step: FlowStep = {
        id: question.question_id,
        questionId: question.question_id,
        questionText: question.question_text,
        questionNumber: question.question_number,
        type,
        level: 0,
        branchIndex: 0,
        connections,
        question,
        height: 0
      };

      this.steps.set(question.question_id, step);
    });
  }

  private getQuestionConnections(question: Question): FlowConnection[] {
    const connections: FlowConnection[] = [];

    Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
      if (placeholder.type === 'select' && placeholder.options) {
        placeholder.options.forEach((option, index) => {
          if (option.leads_to) {
            const connection: FlowConnection = {
              targetId: option.leads_to,
              label: option.label,
              type: this.getConnectionType(option.leads_to),
              sourceHandle: `${placeholderKey}-${index}`
            };

            if (option.add_block) {
              connection.addBlockId = option.add_block;
            }

            connections.push(connection);
          }
        });
      } else if (placeholder.type === 'input' || placeholder.type === 'MultiBlockManager') {
        const leadsTo = (placeholder as any).leads_to;
        if (leadsTo) {
          connections.push({
            targetId: leadsTo,
            label: placeholder.placeholder_label || placeholderKey,
            type: this.getConnectionType(leadsTo),
            sourceHandle: placeholderKey
          });
        }
      }
    });

    return connections;
  }

  private getConnectionType(leadsTo: string): 'normal' | 'stop' | 'next' | 'add' {
    if (leadsTo === 'stop_flow') return 'stop';
    if (leadsTo === 'next_block') return 'next';
    return 'normal';
  }

  private assignLevels(): void {
    // Find root nodes (questions with no incoming connections)
    const incomingConnections = new Set<string>();
    this.steps.forEach(step => {
      step.connections.forEach(conn => {
        if (conn.type === 'normal') {
          incomingConnections.add(conn.targetId);
        }
      });
    });

    const rootNodes = Array.from(this.steps.values()).filter(
      step => !incomingConnections.has(step.id)
    );

    // BFS to assign levels
    const visited = new Set<string>();
    const queue: { stepId: string; level: number }[] = [];

    rootNodes.forEach(root => {
      queue.push({ stepId: root.id, level: 0 });
    });

    while (queue.length > 0) {
      const { stepId, level } = queue.shift()!;
      
      if (visited.has(stepId)) continue;
      visited.add(stepId);

      const step = this.steps.get(stepId);
      if (step) {
        step.level = level;
        
        step.connections.forEach(conn => {
          if (conn.type === 'normal' && this.steps.has(conn.targetId)) {
            queue.push({ stepId: conn.targetId, level: level + 1 });
          }
        });
      }
    }
  }

  private calculateBranchIndices(): void {
    // Group steps by level
    const stepsByLevel = new Map<number, FlowStep[]>();
    this.steps.forEach(step => {
      if (!stepsByLevel.has(step.level)) {
        stepsByLevel.set(step.level, []);
      }
      stepsByLevel.get(step.level)!.push(step);
    });

    // Calculate optimal branch indices with staggered offset
    stepsByLevel.forEach((steps, level) => {
      if (level === 0) {
        // First level - sequential assignment
        steps.forEach((step, index) => {
          step.branchIndex = index;
        });
        return;
      }

      // Find source steps from previous levels
      const sourcesForThisLevel = new Map<string, FlowStep[]>();
      
      steps.forEach(step => {
        // Find which steps from previous levels connect to this step
        this.steps.forEach(sourceStep => {
          if (sourceStep.level < level) {
            const hasConnection = sourceStep.connections.some(
              conn => conn.targetId === step.id && conn.type === 'normal'
            );
            if (hasConnection) {
              if (!sourcesForThisLevel.has(step.id)) {
                sourcesForThisLevel.set(step.id, []);
              }
              sourcesForThisLevel.get(step.id)!.push(sourceStep);
            }
          }
        });
      });

      // Start each new column one slot lower than the previous column (staggered offset)
      let nextAvailablePosition = level;
      
      steps.forEach(step => {
        const sources = sourcesForThisLevel.get(step.id) || [];
        
        if (sources.length > 1) {
          // Multi-source - add extra spacing
          nextAvailablePosition += 1;
        }
        
        step.branchIndex = nextAvailablePosition;
        nextAvailablePosition += 1;
      });
    });
  }

  private calculateHeights(): void {
    this.steps.forEach(step => {
      const headerHeight = 50;
      const questionTextHeight = Math.max(60, Math.ceil(step.questionText.length / 60) * 20);
      const optionsHeaderHeight = step.connections.length > 0 ? 30 : 0;
      const optionHeight = 50;
      
      // Count add blocks
      const addBlockCount = step.connections.filter(c => c.addBlockId).length;
      const addBlockHeight = 45;
      
      const cardPadding = 40;
      const borderSpacing = 20;

      step.height = headerHeight + questionTextHeight + optionsHeaderHeight + 
                   (step.connections.length * optionHeight) + 
                   (addBlockCount * addBlockHeight) + cardPadding + borderSpacing;
    });
  }

  private extractTerminals(steps: FlowStep[]): any[] {
    const terminals: any[] = [];
    const terminalsSeen = new Set<string>();

    steps.forEach(step => {
      step.connections.forEach(conn => {
        if (conn.type !== 'normal' && !terminalsSeen.has(conn.targetId)) {
          terminals.push({
            id: `terminal-${conn.targetId}`,
            type: conn.type,
            label: conn.targetId === 'stop_flow' ? 'STOP FLOW' : 
                   conn.targetId === 'next_block' ? 'NEXT BLOCK' : conn.targetId,
            level: step.level + 1
          });
          terminalsSeen.add(conn.targetId);
        }

        if (conn.addBlockId && !terminalsSeen.has(conn.addBlockId)) {
          terminals.push({
            id: `add-block-${conn.addBlockId}`,
            type: 'add',
            label: `ADD BLOCK: ${conn.addBlockId}`,
            level: step.level + 1
          });
          terminalsSeen.add(conn.addBlockId);
        }
      });
    });

    return terminals;
  }
}
