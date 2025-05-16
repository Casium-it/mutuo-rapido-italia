
import { Block, Question } from "@/types/form";

/**
 * Creates a deep clone of a block with unique IDs
 * @param sourceBlock The source block to clone
 * @param copyIndex The index of the copy, used for ID generation
 * @returns A new Block object with unique IDs
 */
export function deepCloneBlock(sourceBlock: Block, copyIndex: number): Block {
  const blockIdSuffix = `_copy_${copyIndex}`;
  
  // Create new questions with unique IDs
  const clonedQuestions: Question[] = sourceBlock.questions.map(question => {
    // Create a unique question ID
    const newQuestionId = `${question.question_id}${blockIdSuffix}`;
    
    // Deep clone the question
    return {
      ...question,
      question_id: newQuestionId,
      block_id: `${sourceBlock.block_id}${blockIdSuffix}`,
      // Deep clone placeholders to avoid reference issues
      placeholders: { ...question.placeholders }
    };
  });
  
  // Create the clone with a priority slightly higher than the source
  return {
    ...sourceBlock,
    block_id: `${sourceBlock.block_id}${blockIdSuffix}`,
    title: sourceBlock.title, // We'll show the index from the UI
    priority: sourceBlock.priority + (copyIndex * 0.01), // Slight increase in priority for proper ordering
    is_copy_of: sourceBlock.block_id,
    copy_index: copyIndex,
    questions: clonedQuestions,
  };
}

/**
 * Verifica se un blocco è una copia di un altro blocco
 * @param block Il blocco da verificare
 * @returns True se il blocco è una copia, false altrimenti
 */
export function isBlockCopy(block: Block): boolean {
  return !!block.is_copy_of;
}

/**
 * Ottiene l'ID del blocco originale
 * @param block Il blocco da verificare
 * @returns L'ID del blocco originale o l'ID del blocco stesso se non è una copia
 */
export function getOriginalBlockId(block: Block): string {
  return block.is_copy_of || block.block_id;
}
