import { Question, Block } from "@/types/form";

export interface FlowStep {
  id: string;
  questionNumber: string;
  questionText: string;
  type: 'simple' | 'branching' | 'inline' | 'terminal';
  isInline?: boolean;
  connections: FlowConnection[];
}

export interface FlowConnection {
  targetId: string;
  label: string;
  type: 'next' | 'option' | 'add_block' | 'stop';
}

export interface SimpleFlowData {
  steps: FlowStep[];
}

export class FlowAnalyzer {
  static analyzeBlock(block: Block): SimpleFlowData {
    const steps: FlowStep[] = [];
    const questionMap = new Map<string, Question>();
    
    // Create question map for quick lookup
    block.questions.forEach(q => questionMap.set(q.question_id, q));
    
    // Process each question sequentially
    block.questions.forEach((question) => {
      const connections = this.getQuestionConnections(question, block.questions);
      
      // Determine question type
      let type: FlowStep['type'] = 'simple';
      if (connections.length > 1) type = 'branching';
      if (question.inline) type = 'inline';
      if (connections.length === 0 || connections.some(c => c.type === 'stop')) type = 'terminal';
      
      steps.push({
        id: question.question_id,
        questionNumber: question.question_number,
        questionText: this.truncateText(question.question_text, 80),
        type,
        isInline: question.inline,
        connections
      });
    });
    
    return { steps };
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