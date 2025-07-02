import { Question, Block } from "@/types/form";

export interface FlowStep {
  id: string;
  questionNumber: string;
  questionText: string;
  type: 'simple' | 'branching' | 'inline' | 'terminal';
  isInline?: boolean;
  connections: FlowConnection[];
  level: number;
  branchIndex: number;
}

export interface FlowConnection {
  targetId: string;
  label: string;
  type: 'next' | 'option' | 'add_block' | 'stop';
}

export interface FlowLevel {
  steps: FlowStep[];
}

export interface SimpleFlowData {
  levels: FlowLevel[];
  maxLevel: number;
}

export class FlowAnalyzer {
  static analyzeBlock(block: Block): SimpleFlowData {
    const questionMap = new Map<string, Question>();
    const stepMap = new Map<string, FlowStep>();
    
    // Create question map for quick lookup
    block.questions.forEach(q => questionMap.set(q.question_id, q));
    
    // Create initial steps
    block.questions.forEach((question) => {
      const connections = this.getQuestionConnections(question, block.questions);
      
      // Determine question type
      let type: FlowStep['type'] = 'simple';
      if (connections.length > 1) type = 'branching';
      if (question.inline) type = 'inline';
      if (connections.length === 0 || connections.some(c => c.type === 'stop')) type = 'terminal';
      
      stepMap.set(question.question_id, {
        id: question.question_id,
        questionNumber: question.question_number,
        questionText: this.truncateText(question.question_text, 80),
        type,
        isInline: question.inline,
        connections,
        level: 0,
        branchIndex: 0
      });
    });
    
    // Calculate levels and branching
    return this.calculateLevelsAndBranching(stepMap, block.questions);
  }

  private static calculateLevelsAndBranching(stepMap: Map<string, FlowStep>, questions: Question[]): SimpleFlowData {
    const levels: FlowLevel[] = [];
    const visited = new Set<string>();
    const levelMap = new Map<string, number>();
    
    // Start with the first question
    if (questions.length === 0) return { levels: [], maxLevel: 0 };
    
    const firstQuestion = questions[0];
    this.assignLevels(firstQuestion.question_id, 0, stepMap, levelMap, visited);
    
    // Group steps by level
    const stepsByLevel = new Map<number, FlowStep[]>();
    
    stepMap.forEach((step, id) => {
      const level = levelMap.get(id) || 0;
      step.level = level;
      
      if (!stepsByLevel.has(level)) {
        stepsByLevel.set(level, []);
      }
      stepsByLevel.get(level)!.push(step);
    });
    
    // Calculate branch indices for each level
    stepsByLevel.forEach((steps, level) => {
      steps.forEach((step, index) => {
        step.branchIndex = index;
      });
      
      levels[level] = { steps };
    });
    
    const maxLevel = Math.max(...Array.from(stepsByLevel.keys()));
    
    return { levels, maxLevel };
  }
  
  private static assignLevels(
    questionId: string, 
    level: number, 
    stepMap: Map<string, FlowStep>, 
    levelMap: Map<string, number>,
    visited: Set<string>
  ): void {
    if (visited.has(questionId)) return;
    visited.add(questionId);
    
    const currentLevel = levelMap.get(questionId) || 0;
    levelMap.set(questionId, Math.max(currentLevel, level));
    
    const step = stepMap.get(questionId);
    if (!step) return;
    
    // Process connections to next level
    const targetQuestions = new Set<string>();
    step.connections.forEach(conn => {
      if (conn.targetId !== 'stop' && conn.targetId !== 'next_block') {
        targetQuestions.add(conn.targetId);
      }
    });
    
    targetQuestions.forEach(targetId => {
      this.assignLevels(targetId, level + 1, stepMap, levelMap, visited);
    });
  }

  private static getQuestionConnections(question: Question, allQuestions: Question[]): FlowConnection[] {
    const connections: FlowConnection[] = [];
    
    Object.entries(question.placeholders || {}).forEach(([key, placeholder]) => {
      if (placeholder.type === 'select') {
        const selectPlaceholder = placeholder as any;
        selectPlaceholder.options?.forEach((option: any) => {
          if (option.leads_to === 'stop_flow') {
            connections.push({
              targetId: 'stop',
              label: option.label,
              type: 'stop'
            });
          } else if (option.leads_to === 'next_block') {
            connections.push({
              targetId: 'next_block',
              label: option.label,
              type: option.add_block ? 'add_block' : 'next'
            });
          } else if (option.leads_to) {
            connections.push({
              targetId: option.leads_to,
              label: option.label,
              type: option.add_block ? 'add_block' : 'option'
            });
          }
        });
      } else if (placeholder.type === 'input') {
        const inputPlaceholder = placeholder as any;
        if (inputPlaceholder.leads_to === 'stop_flow') {
          connections.push({
            targetId: 'stop',
            label: 'Continua',
            type: 'stop'
          });
        } else if (inputPlaceholder.leads_to === 'next_block') {
          connections.push({
            targetId: 'next_block',
            label: 'Continua',
            type: 'next'
          });
        } else if (inputPlaceholder.leads_to) {
          connections.push({
            targetId: inputPlaceholder.leads_to,
            label: 'Continua',
            type: 'next'
          });
        }
      } else if (placeholder.type === 'MultiBlockManager') {
        const managerPlaceholder = placeholder as any;
        if (managerPlaceholder.leads_to === 'next_block') {
          connections.push({
            targetId: 'next_block',
            label: 'Continua',
            type: 'next'
          });
        } else if (managerPlaceholder.leads_to) {
          connections.push({
            targetId: managerPlaceholder.leads_to,
            label: 'Continua',
            type: 'next'
          });
        }
      }
    });
    
    return connections;
  }

  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}