
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
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BlockValidation {
  activationSources: {
    activators: BlockActivator[];
    hasDefault: boolean;
    isValid: boolean;
  };
  leadsToValidation: ValidationResult;
}

/**
 * Find all blocks that can activate the given block through add_block references
 */
export function findBlockActivators(targetBlockId: string, allBlocks: AdminBlock[]): BlockActivator[] {
  const activators: BlockActivator[] = [];

  allBlocks.forEach(block => {
    block.questions.forEach(question => {
      Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
        if (placeholder.type === 'select' && placeholder.options) {
          placeholder.options.forEach(option => {
            if (option.add_block === targetBlockId) {
              activators.push({
                blockId: block.block_id,
                blockTitle: block.title,
                questionId: question.question_id,
                optionId: option.id,
                optionLabel: option.label
              });
            }
          });
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

  block.questions.forEach(question => {
    Object.entries(question.placeholders).forEach(([placeholderKey, placeholder]) => {
      // Check input placeholder leads_to
      if (placeholder.type === 'input' && placeholder.leads_to) {
        if (!blockQuestionIds.has(placeholder.leads_to) && !specialValues.has(placeholder.leads_to)) {
          errors.push(`Question ${question.question_id}, placeholder ${placeholderKey}: leads_to "${placeholder.leads_to}" not found`);
        }
      }
      
      // Check MultiBlockManager leads_to
      if (placeholder.type === 'MultiBlockManager' && placeholder.leads_to) {
        if (!blockQuestionIds.has(placeholder.leads_to) && !specialValues.has(placeholder.leads_to)) {
          errors.push(`Question ${question.question_id}, placeholder ${placeholderKey}: leads_to "${placeholder.leads_to}" not found`);
        }
      }
      
      // Check select option leads_to
      if (placeholder.type === 'select' && placeholder.options) {
        placeholder.options.forEach(option => {
          if (!blockQuestionIds.has(option.leads_to) && !specialValues.has(option.leads_to)) {
            errors.push(`Question ${question.question_id}, option ${option.id}: leads_to "${option.leads_to}" not found`);
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
