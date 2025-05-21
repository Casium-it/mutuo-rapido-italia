
import { useForm } from "@/contexts/FormContext";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { Block, PlaceholderOption, Question } from "@/types/form";
import { getInputValidationBehavior } from "@/utils/validationUtils";

export const useFormExtended = () => {
  const formContext = useForm();
  const navigate = useNavigate();
  const { 
    state, 
    blocks, 
    goToQuestion, 
    isBlockCompleted, 
    getInlineQuestionChain,
    getPreviousQuestion,
    getPreviousQuestionText
  } = formContext;

  // Get all available blocks
  const getBlocks = useCallback(() => {
    return blocks;
  }, [blocks]);

  // Get a block by ID
  const getBlockById = useCallback((blockId: string): Block | undefined => {
    return blocks.find(block => block.block_id === blockId);
  }, [blocks]);

  // Get all dynamic blocks created from a specific blueprint
  const getDynamicBlocksByBlueprint = useCallback(
    (blueprintId: string): Block[] => {
      // Extract base ID from blueprint (removing {copyNumber})
      const baseBlueprintId = blueprintId.replace('{copyNumber}', '');
      
      return state.dynamicBlocks
        .filter(block => {
          if (block.blueprint_id) {
            // Check if this block was created from the blueprint
            // We need to handle both exact match and base match (without copy number)
            const baseBlockBlueprintId = block.blueprint_id.replace(/\d+$/, '');
            return block.blueprint_id === blueprintId || 
                   baseBlockBlueprintId === baseBlueprintId;
          }
          return false;
        })
        .sort((a, b) => (a.copy_number || 0) - (b.copy_number || 0));
    },
    [state.dynamicBlocks]
  );

  // Navigate to the first question of a dynamic block
  const navigateToDynamicBlock = useCallback(
    (blockId: string): boolean => {
      const block = blocks.find(b => b.block_id === blockId);
      
      if (block && block.questions.length > 0) {
        goToQuestion(blockId, block.questions[0].question_id);
        return true;
      }
      return false;
    },
    [blocks, goToQuestion]
  );

  // Get the current active question
  const getActiveQuestion = useCallback((): Question | null => {
    const { block_id, question_id } = state.activeQuestion;
    
    const block = blocks.find(b => b.block_id === block_id);
    if (!block) return null;
    
    const question = block.questions.find(q => q.question_id === question_id);
    return question || null;
  }, [state.activeQuestion, blocks]);
  
  // Get all active blocks with priority
  const getActiveBlocksWithPriority = useCallback((): Block[] => {
    return state.activeBlocks
      .map(blockId => blocks.find(b => b.block_id === blockId))
      .filter(Boolean) as Block[];
  }, [state.activeBlocks, blocks]);

  // Get a summary of responses for a block
  const getBlockResponseSummary = useCallback((blockId: string): string | null => {
    const block = blocks.find(b => b.block_id === blockId);
    if (!block) return null;
    
    const responseStrings: string[] = [];
    
    for (const question of block.questions) {
      for (const [placeholderKey, placeholder] of Object.entries(question.placeholders)) {
        const response = formContext.getResponse(question.question_id, placeholderKey);
        
        if (response !== undefined) {
          if (placeholder.type === "select") {
            // Handle select placeholder
            if (Array.isArray(response)) {
              // Handle multi-select
              const selectedOptions = response
                .map(val => placeholder.options.find(opt => opt.id === val))
                .filter(Boolean)
                .map(opt => opt!.label);
              
              if (selectedOptions.length > 0) {
                responseStrings.push(`<strong>${selectedOptions.join(", ")}</strong>`);
              }
            } else {
              // Handle single select
              const option = placeholder.options.find(opt => opt.id === response);
              if (option) {
                responseStrings.push(`<strong>${option.label}</strong>`);
              }
            }
          } else if (placeholder.type === "input") {
            // Handle input placeholder
            const validator = getInputValidationBehavior(placeholder.input_validation);
            const formattedValue = validator ? validator.format(response as string) : response;
            responseStrings.push(`<strong>${formattedValue}</strong>`);
          }
        }
      }
    }
    
    return responseStrings.length > 0 ? responseStrings.join(" ") : null;
  }, [blocks, formContext]);

  return {
    ...formContext,
    getBlocks,
    getBlockById,
    getDynamicBlocksByBlueprint,
    navigateToDynamicBlock,
    getActiveQuestion,
    getActiveBlocksWithPriority,
    getBlockResponseSummary,
    isBlockCompleted
  };
};
