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
  sourceConnections: SourceConnection[];
}

export interface FlowConnection {
  targetId: string;
  label: string;
  type: 'next' | 'option' | 'add_block' | 'stop';
}

export interface SourceConnection {
  sourceId: string;
  label: string;
  type: 'next' | 'option' | 'add_block' | 'stop';
}

export interface FlowLevel {
  steps: FlowStep[];
}

export interface SimpleFlowData {
  levels: FlowLevel[];
  maxLevel: number;
  connections: FlowVisualConnection[];
}

export interface FlowVisualConnection {
  fromLevel: number;
  fromIndex: number;
  toLevel: number;
  toIndex: number;
  label: string;
  type: 'next' | 'option' | 'add_block' | 'stop';
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
        branchIndex: 0,
        sourceConnections: []
      });
    });
    
    // Calculate levels and branching
    return this.calculateBranchingFlow(stepMap, block.questions);
  }

  private static calculateBranchingFlow(stepMap: Map<string, FlowStep>, questions: Question[]): SimpleFlowData {
    if (questions.length === 0) return { levels: [], maxLevel: 0, connections: [] };
    
    const levels: FlowLevel[] = [];
    const connections: FlowVisualConnection[] = [];
    const levelAssignments = new Map<string, number>();
    const branchAssignments = new Map<string, number>();
    const processed = new Set<string>();
    
    // Start with first question at level 0
    const firstQuestion = questions[0];
    levelAssignments.set(firstQuestion.question_id, 0);
    branchAssignments.set(firstQuestion.question_id, 0);
    
    // Process all questions level by level
    this.assignLevelsAndBranches(firstQuestion.question_id, 0, stepMap, levelAssignments, branchAssignments, processed);
    
    // Group steps by level
    const stepsByLevel = new Map<number, FlowStep[]>();
    
    stepMap.forEach((step, id) => {
      const level = levelAssignments.get(id) || 0;
      step.level = level;
      
      if (!stepsByLevel.has(level)) {
        stepsByLevel.set(level, []);
      }
      stepsByLevel.get(level)!.push(step);
    });
    
    // Calculate optimal branch indices to minimize overlaps
    this.calculateOptimalBranchIndices(stepsByLevel, stepMap, levelAssignments);
    
    // Create level structure
    const maxLevel = Math.max(...Array.from(stepsByLevel.keys()));
    for (let i = 0; i <= maxLevel; i++) {
      const levelSteps = stepsByLevel.get(i) || [];
      levelSteps.sort((a, b) => a.branchIndex - b.branchIndex);
      levels[i] = { steps: levelSteps };
    }
    
    // Create visual connections
    stepMap.forEach((step, stepId) => {
      const fromLevel = levelAssignments.get(stepId) || 0;
      const fromIndex = levels[fromLevel].steps.findIndex(s => s.id === stepId);
      
      step.connections.forEach(conn => {
        if (conn.targetId !== 'stop' && conn.targetId !== 'next_block') {
          const toLevel = levelAssignments.get(conn.targetId) || 0;
          const toIndex = levels[toLevel]?.steps.findIndex(s => s.id === conn.targetId) || 0;
          
          connections.push({
            fromLevel,
            fromIndex,
            toLevel,
            toIndex,
            label: conn.label,
            type: conn.type
          });
        }
      });
    });
    
    return { levels, maxLevel, connections };
  }

  private static calculateOptimalBranchIndices(
    stepsByLevel: Map<number, FlowStep[]>,
    stepMap: Map<string, FlowStep>,
    levelAssignments: Map<string, number>
  ): void {
    // For each level, calculate optimal positions based on source connections
    stepsByLevel.forEach((steps, level) => {
      if (level === 0) {
        // First level - just assign sequential indices
        steps.forEach((step, index) => {
          step.branchIndex = index;
        });
        return;
      }

      // PASS 1: Detect multi-source questions and build dependency map
      const multiSourceSteps = new Set<string>();
      const sourceMap = new Map<string, string[]>();
      
      steps.forEach(step => {
        const sources: string[] = [];
        stepMap.forEach((sourceStep, sourceId) => {
          if (sourceStep.connections.some(conn => conn.targetId === step.id)) {
            sources.push(sourceId);
          }
        });
        sourceMap.set(step.id, sources);
        
        // Mark as multi-source if it has more than one incoming connection
        if (sources.length > 1) {
          multiSourceSteps.add(step.id);
        }
      });

      // PASS 2: Calculate required space for each branching source
      const branchingFootprint = new Map<string, number>();
      stepMap.forEach((sourceStep, sourceId) => {
        const targets = sourceStep.connections
          .filter(conn => conn.targetId !== 'stop' && conn.targetId !== 'next_block')
          .map(conn => conn.targetId);
        
        if (targets.length > 1) {
          // Calculate how much vertical space this branching source needs
          let requiredSpace = targets.length;
          
          // Add extra space for multi-source targets that need to be separated
          targets.forEach(targetId => {
            if (multiSourceSteps.has(targetId)) {
              requiredSpace += 1; // Extra spacing for multi-source questions
            }
          });
          
          branchingFootprint.set(sourceId, requiredSpace);
        }
      });

      // PASS 3: Smart positioning with conflict avoidance
      const assignedPositions = new Set<number>();
      const reservedSlots = new Map<string, number>(); // questionId -> reserved position
      let nextAvailablePosition = 0;

      // First, handle single-source questions (maintain alignment when possible)
      const singleSourceSteps = steps.filter(step => {
        const sources = sourceMap.get(step.id) || [];
        return sources.length === 1 && !multiSourceSteps.has(step.id);
      });

      singleSourceSteps.forEach(step => {
        const sources = sourceMap.get(step.id) || [];
        if (sources.length === 1) {
          const sourceStep = stepMap.get(sources[0]);
          if (sourceStep) {
            const sourcePosition = sourceStep.branchIndex;
            
            // Try to align with source position if available
            if (!assignedPositions.has(sourcePosition)) {
              step.branchIndex = sourcePosition;
              assignedPositions.add(sourcePosition);
            } else {
              // Find next available position
              while (assignedPositions.has(nextAvailablePosition)) {
                nextAvailablePosition++;
              }
              step.branchIndex = nextAvailablePosition;
              assignedPositions.add(nextAvailablePosition);
              nextAvailablePosition++;
            }
          }
        }
      });

      // Second, handle multi-source questions (need separate positioning)
      const multiSourceStepsList = steps.filter(step => multiSourceSteps.has(step.id));
      
      multiSourceStepsList.forEach(step => {
        // Find next available position that ensures separation
        while (assignedPositions.has(nextAvailablePosition)) {
          nextAvailablePosition++;
        }
        
        step.branchIndex = nextAvailablePosition;
        assignedPositions.add(nextAvailablePosition);
        nextAvailablePosition++;
      });

      // Third, handle any remaining steps from branching sources
      const remainingSteps = steps.filter(step => {
        const sources = sourceMap.get(step.id) || [];
        return sources.length === 1 && !singleSourceSteps.includes(step) && !multiSourceSteps.has(step.id);
      });

      // Group remaining steps by their source and handle branching
      const sourceToTargets = new Map<string, FlowStep[]>();
      remainingSteps.forEach(step => {
        const sources = sourceMap.get(step.id) || [];
        sources.forEach(sourceId => {
          if (!sourceToTargets.has(sourceId)) {
            sourceToTargets.set(sourceId, []);
          }
          sourceToTargets.get(sourceId)!.push(step);
        });
      });

      // Process each branching source
      sourceToTargets.forEach((targetSteps, sourceId) => {
        const sourceStep = stepMap.get(sourceId);
        if (!sourceStep || targetSteps.length <= 1) return;

        // For multiple targets, ensure they're spread vertically
        targetSteps.forEach((targetStep, index) => {
          while (assignedPositions.has(nextAvailablePosition)) {
            nextAvailablePosition++;
          }
          targetStep.branchIndex = nextAvailablePosition;
          assignedPositions.add(nextAvailablePosition);
          nextAvailablePosition++;
        });
      });

      // Handle any unassigned steps
      steps.forEach(step => {
        if (step.branchIndex === undefined) {
          while (assignedPositions.has(nextAvailablePosition)) {
            nextAvailablePosition++;
          }
          step.branchIndex = nextAvailablePosition;
          assignedPositions.add(nextAvailablePosition);
          nextAvailablePosition++;
        }
      });

      // Normalize all indices to start from 0 and be sequential
      const sortedSteps = [...steps].sort((a, b) => a.branchIndex - b.branchIndex);
      sortedSteps.forEach((step, index) => {
        step.branchIndex = index;
      });
    });
  }
  
  private static assignLevelsAndBranches(
    questionId: string,
    level: number,
    stepMap: Map<string, FlowStep>,
    levelAssignments: Map<string, number>,
    branchAssignments: Map<string, number>,
    processed: Set<string>
  ): void {
    if (processed.has(questionId)) return;
    processed.add(questionId);
    
    const step = stepMap.get(questionId);
    if (!step) return;
    
    // Set current question level
    const currentLevel = Math.max(levelAssignments.get(questionId) || 0, level);
    levelAssignments.set(questionId, currentLevel);
    
    // Process connections to assign next level
    const targetQuestions = step.connections
      .filter(conn => conn.targetId !== 'stop' && conn.targetId !== 'next_block')
      .map(conn => conn.targetId);
    
    if (targetQuestions.length > 0) {
      const nextLevel = currentLevel + 1;
      
      // Assign branch indices for target questions
      targetQuestions.forEach((targetId, index) => {
        const existingLevel = levelAssignments.get(targetId);
        if (!existingLevel || existingLevel < nextLevel) {
          levelAssignments.set(targetId, nextLevel);
          
          // Calculate branch index
          const currentBranchCount = Array.from(branchAssignments.entries())
            .filter(([id, _]) => levelAssignments.get(id) === nextLevel).length;
          
          branchAssignments.set(targetId, currentBranchCount);
        }
        
        this.assignLevelsAndBranches(targetId, nextLevel, stepMap, levelAssignments, branchAssignments, processed);
      });
    }
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
    return text.substring(0, maxLength) + "...";
  }
}
