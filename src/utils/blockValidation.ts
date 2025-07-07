import { Block } from "@/types/form";

interface AdminBlock extends Block {
  form_id: string;
  form_title: string;
  form_slug: string;
  form_type: string;
}

export interface BlockActivator {
  blockId: string;
  blockTitle: string;
  questionId: string;
  optionId: string;
  optionLabel: string;
  type: 'option'; // Regular option activation
}

export interface MultiBlockActivator {
  blockId: string;
  blockTitle: string;
  questionId: string;
  placeholderId: string;
  blueprintPattern: string;
  type: 'multiblock'; // Multi-block activation
}

export type BlockActivatorUnion = BlockActivator | MultiBlockActivator;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BlockValidation {
  activationSources: {
    activators: BlockActivatorUnion[];
    hasDefault: boolean;
    isValid: boolean;
  };
  leadsToValidation: ValidationResult;
}

/**
 * Validate a specific leads_to reference
 */
export function validateSpecificLeadsTo(
  leadsTo: string,
  blockQuestionIds: Set<string>,
  specialValues: Set<string>,
  activatingQuestionId: string | null
): string | null {
  const isValidReference = blockQuestionIds.has(leadsTo) || 
                         specialValues.has(leadsTo) ||
                         (activatingQuestionId && leadsTo === activatingQuestionId);
  
  if (!isValidReference) {
    return `"${leadsTo}" non trovato`;
  }
  
  return null;
}

/**
 * Find all blocks that can activate the given block through add_block references or MultiBlockManager
 */
export function findBlockActivators(targetBlockId: string, allBlocks: AdminBlock[]): BlockActivatorUnion[] {
  const activators: BlockActivatorUnion[] = [];

  allBlocks.forEach(block => {
    block.questions.forEach(question => {
      Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
        // Check for regular option activations (add_block)
        if (placeholder.type === 'select' && placeholder.options) {
          placeholder.options.forEach(option => {
            if (option.add_block === targetBlockId) {
              activators.push({
                blockId: block.block_id,
                blockTitle: block.title,
                questionId: question.question_id,
                optionId: option.id,
                optionLabel: option.label,
                type: 'option'
              });
            }
          });
        }
        
        // Check for MultiBlockManager activations
        if (placeholder.type === 'MultiBlockManager' && placeholder.blockBlueprint) {
          // Extract the blueprint base name (remove {copyNumber})
          const blueprintBase = placeholder.blockBlueprint.replace('{copyNumber}', '');
          
          // Check if the target block matches this blueprint pattern
          // Multi-blocks should have a blueprint_id that matches the base
          const targetBlock = allBlocks.find(b => b.block_id === targetBlockId);
          if (targetBlock && targetBlock.multiBlock) {
            // For multi-blocks, check if the block_id starts with the blueprint base
            if (targetBlockId.startsWith(blueprintBase)) {
              activators.push({
                blockId: block.block_id,
                blockTitle: block.title,
                questionId: question.question_id,
                placeholderId: placeholderKey,
                blueprintPattern: placeholder.blockBlueprint,
                type: 'multiblock'
              });
            }
          }
        }
      });
    });
  });

  return activators;
}

/**
 * Validate that all leads_to references within a block are valid
 */
export function validateLeadsTo(block: AdminBlock, allBlocks: AdminBlock[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Get all question IDs in this block for validation
  const blockQuestionIds = new Set(block.questions.map(q => q.question_id));
  
  // Special valid leads_to values
  const specialValues = new Set(['next_block', 'stop_flow', 'end_form']);

  // For multi-blocks, find the activating question ID
  let activatingQuestionId: string | null = null;
  if (block.multiBlock) {
    const activators = findBlockActivators(block.block_id, allBlocks);
    const multiBlockActivator = activators.find(a => a.type === 'multiblock') as MultiBlockActivator;
    if (multiBlockActivator) {
      activatingQuestionId = multiBlockActivator.questionId;
    }
  }

  block.questions.forEach(question => {
    Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
      // Check input placeholder leads_to
      if (placeholder.type === 'input' && placeholder.leads_to) {
        const leadsTo = placeholder.leads_to;
        
        // Check if it's a valid reference
        const isValidReference = blockQuestionIds.has(leadsTo) || 
                               specialValues.has(leadsTo) ||
                               (activatingQuestionId && leadsTo === activatingQuestionId);
        
        if (!isValidReference) {
          errors.push(`Question ${question.question_id}, placeholder ${placeholderKey}: leads_to "${leadsTo}" not found`);
        }
      }
      
      // Check MultiBlockManager leads_to
      if (placeholder.type === 'MultiBlockManager' && placeholder.leads_to) {
        const leadsTo = placeholder.leads_to;
        
        const isValidReference = blockQuestionIds.has(leadsTo) || 
                               specialValues.has(leadsTo) ||
                               (activatingQuestionId && leadsTo === activatingQuestionId);
        
        if (!isValidReference) {
          errors.push(`Question ${question.question_id}, placeholder ${placeholderKey}: leads_to "${leadsTo}" not found`);
        }
      }
      
      // Check select option leads_to
      if (placeholder.type === 'select' && placeholder.options) {
        placeholder.options.forEach(option => {
          const leadsTo = option.leads_to;
          
          const isValidReference = blockQuestionIds.has(leadsTo) || 
                                 specialValues.has(leadsTo) ||
                                 (activatingQuestionId && leadsTo === activatingQuestionId);
          
          if (!isValidReference) {
            errors.push(`Question ${question.question_id}, option ${option.id}: leads_to "${leadsTo}" not found`);
          }
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get complete validation status for a block
 */
export function getBlockValidation(block: AdminBlock, allBlocks: AdminBlock[]): BlockValidation {
  const activators = findBlockActivators(block.block_id, allBlocks);
  const hasDefault = block.default_active === true;
  
  return {
    activationSources: {
      activators,
      hasDefault,
      isValid: activators.length > 0 || hasDefault
    },
    leadsToValidation: validateLeadsTo(block, allBlocks)
  };
}
