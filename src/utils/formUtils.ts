import { Block, Question } from "@/types/form";

/**
 * Gets the previous question of a given question in a block
 * @param blocks All form blocks
 * @param blockId Current block ID
 * @param questionId Current question ID
 * @returns The previous question or undefined if none exists
 */
export const getPreviousQuestion = (
  blocks: Block[],
  blockId: string,
  questionId: string
): Question | undefined => {
  const currentBlock = blocks.find(block => block.block_id === blockId);
  if (!currentBlock) return undefined;

  const questionIndex = currentBlock.questions.findIndex(q => q.question_id === questionId);
  if (questionIndex <= 0) return undefined;

  return currentBlock.questions[questionIndex - 1];
};

/**
 * Gets the last answered question in the same block, excluding the current question
 * @param blocks All form blocks
 * @param blockId Current block ID
 * @param currentQuestionId Current question ID to exclude
 * @param answeredQuestions Set of answered question IDs
 * @returns The last answered question in the block or undefined if none exists
 */
export const getLastAnsweredQuestionInBlock = (
  blocks: Block[],
  blockId: string,
  currentQuestionId: string,
  answeredQuestions: Set<string>
): Question | undefined => {
  const currentBlock = blocks.find(block => block.block_id === blockId);
  if (!currentBlock) return undefined;

  // Find all answered questions in this block, excluding the current one
  const answeredQuestionsInBlock = currentBlock.questions.filter(q => 
    q.question_id !== currentQuestionId && answeredQuestions.has(q.question_id)
  );

  // Return the last one (most recently answered based on order in the block)
  return answeredQuestionsInBlock.length > 0 ? 
    answeredQuestionsInBlock[answeredQuestionsInBlock.length - 1] : 
    undefined;
};

/**
 * Gets a chain of all connected inline questions, using actual navigation path
 * 
 * @param blocks All form blocks
 * @param blockId Current block ID
 * @param questionId Current question ID
 * @param answeredQuestions Set of answered question IDs (for navigation-aware logic)
 * @param includeCurrent Whether to include the current question in the chain
 * @returns Array of questions in the chain, ordered from first to last
 */
export const getChainOfInlineQuestions = (
  blocks: Block[],
  blockId: string,
  questionId: string,
  answeredQuestions?: Set<string>,
  includeCurrent: boolean = false
): Question[] => {
  const currentBlock = blocks.find(block => block.block_id === blockId);
  if (!currentBlock) return [];

  const questionIndex = currentBlock.questions.findIndex(q => q.question_id === questionId);
  if (questionIndex < 0) return [];

  const currentQuestion = currentBlock.questions[questionIndex];
  
  // Se non è una domanda inline o è la prima domanda del blocco, restituisci solo la domanda corrente
  if (questionIndex === 0 || !currentQuestion.inline) {
    return includeCurrent ? [currentQuestion] : [];
  }

  // If answeredQuestions is provided, use navigation-aware logic
  if (answeredQuestions) {
    const lastAnsweredQuestion = getLastAnsweredQuestionInBlock(
      blocks, 
      blockId, 
      questionId, 
      answeredQuestions
    );
    
    if (lastAnsweredQuestion) {
      const chain: Question[] = [lastAnsweredQuestion];
      
      // Add the current question if requested
      if (includeCurrent) {
        chain.push(currentQuestion);
      }
      
      return chain;
    }
  }

  // Fallback to array-based logic if no answeredQuestions or no answered questions found
  // Trova l'indice della prima domanda non inline nella catena
  let startIndex = questionIndex - 1;
  while (startIndex > 0 && currentBlock.questions[startIndex].inline) {
    startIndex--;
  }
  
  // Inizia la catena con la prima domanda non inline (o la prima del blocco)
  const chain: Question[] = [currentBlock.questions[startIndex]];
  
  // Aggiungi tutte le domande inline successive fino alla domanda corrente (esclusa)
  for (let i = startIndex + 1; i < questionIndex; i++) {
    chain.push(currentBlock.questions[i]);
  }
  
  // Aggiungi la domanda corrente alla fine se richiesto
  if (includeCurrent) {
    chain.push(currentQuestion);
  }
  
  return chain;
};

/**
 * Gets the text value with responses from a question
 * @param question The question object
 * @param responses The form responses
 * @returns Text with responses inserted
 */
export const getQuestionTextWithResponses = (
  question: Question,
  responses: { [question_id: string]: { [placeholder_key: string]: string | string[] } }
): string => {
  if (!question || !question.question_text) return "";

  let text = question.question_text;
  
  Object.keys(question.placeholders || {}).forEach(key => {
    const placeholder = `{{${key}}}`;
    const responseValue = responses[question.question_id]?.[key];
    
    if (responseValue) {
      let displayValue = "";
      
      // Handle select type placeholders
      if (question.placeholders[key].type === "select" && !Array.isArray(responseValue)) {
        const option = (question.placeholders[key] as any).options.find(
          (opt: any) => opt.id === responseValue
        );
        if (option) {
          displayValue = option.label;
        }
      } else {
        // Handle other types
        displayValue = Array.isArray(responseValue) 
          ? responseValue.join(", ") 
          : responseValue.toString();
      }
      
      text = text.replace(placeholder, displayValue);
    }
  });
  
  // Replace any remaining placeholders
  text = text.replace(/\{\{[^}]+\}\}/g, "____");
  
  return text;
};

/**
 * Gets the text value with clickable responses (for inline questions)
 * @param question The question object
 * @param responses The form responses
 * @returns Object with parts array containing text and response objects
 */
export const getQuestionTextWithClickableResponses = (
  question: Question,
  responses: { [question_id: string]: { [placeholder_key: string]: string | string[] } }
): { parts: Array<{type: 'text' | 'response', content: string, placeholderKey?: string}> } => {
  if (!question || !question.question_text) return { parts: [] };

  const text = question.question_text;
  const parts: Array<{type: 'text' | 'response', content: string, placeholderKey?: string}> = [];
  
  let lastIndex = 0;
  const regex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Aggiungi testo prima del placeholder
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    const placeholderKey = match[1];
    const responseValue = responses[question.question_id]?.[placeholderKey];
    
    if (responseValue) {
      let displayValue = "";
      
      // Handle select type placeholders
      if (question.placeholders[placeholderKey].type === "select" && !Array.isArray(responseValue)) {
        const option = (question.placeholders[placeholderKey] as any).options.find(
          (opt: any) => opt.id === responseValue
        );
        if (option) {
          displayValue = option.label;
        }
      } else {
        // Handle other types
        displayValue = Array.isArray(responseValue) 
          ? responseValue.join(", ") 
          : responseValue.toString();
      }
      
      parts.push({
        type: 'response',
        content: displayValue,
        placeholderKey: placeholderKey
      });
    } else {
      parts.push({
        type: 'text',
        content: "____"
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Aggiungi il testo rimanente
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  return { parts };
};

/**
 * Gets the leads_to value for a specific question, placeholder, and response value
 * @param question The question object
 * @param placeholderKey The placeholder key
 * @param value The response value
 * @returns The leads_to value or null if not found
 */
export const getPlaceholderLeadsTo = (
  question: Question,
  placeholderKey: string,
  value: string | string[]
): string | null => {
  if (!question || !question.placeholders || !question.placeholders[placeholderKey]) {
    return null;
  }
  
  const placeholder = question.placeholders[placeholderKey];
  
  // Per i placeholder di tipo select
  if (placeholder.type === "select") {
    if (Array.isArray(value)) {
      // Se è una selezione multipla, non gestiamo lead_to (di solito non usato in multi-select)
      return null;
    } else {
      // Trova l'opzione selezionata
      const selectedOption = (placeholder as any).options.find((opt: any) => opt.id === value);
      return selectedOption?.leads_to || null;
    }
  }
  
  // Per i placeholder di tipo input o altro con lead_to diretto
  if ((placeholder as any).leads_to) {
    return (placeholder as any).leads_to;
  }
  
  return null;
};

/**
 * Checks if a question ID is a MultiBlockManager question
 * @param blocks All form blocks
 * @param questionId Question ID to check
 * @returns Boolean indicating if the question is a MultiBlockManager
 */
export const isMultiBlockManagerQuestion = (
  blocks: Block[],
  questionId: string
): boolean => {
  for (const block of blocks) {
    const question = block.questions.find(q => q.question_id === questionId);
    if (question) {
      // Controlla se c'è un placeholder di tipo MultiBlockManager
      for (const key in question.placeholders) {
        if (question.placeholders[key].type === "MultiBlockManager") {
          return true;
        }
      }
      return false;
    }
  }
  return false;
};

/**
 * Determines if a block is a dynamic block based on its ID
 * @param blockId Block ID to check
 * @returns Boolean indicating if the block is dynamic
 */
export const isDynamicBlock = (blockId: string): boolean => {
  // I blocchi dinamici tipicamente hanno un numero alla fine del loro ID
  return /^.+?\d+$/.test(blockId);
};

/**
 * Gets the parent multiblock manager question for a dynamic block
 * @param blocks All form blocks
 * @param dynamicBlockId Dynamic block ID
 * @returns The parent multiblock manager question ID or null
 */
export const getParentMultiBlockManager = (
  blocks: Block[],
  dynamicBlockId: string
): string | null => {
  // Trova il blocco dinamico
  const dynamicBlock = blocks.find(b => b.block_id === dynamicBlockId);
  if (!dynamicBlock || !dynamicBlock.blueprint_id) return null;
  
  // Cerca in tutti i blocchi per trovare domande con MultiBlockManager che utilizzano questo blueprint
  for (const block of blocks) {
    for (const question of block.questions) {
      for (const key in question.placeholders) {
        const placeholder = question.placeholders[key];
        if (
          placeholder.type === "MultiBlockManager" &&
          (placeholder as any).blockBlueprint === dynamicBlock.blueprint_id
        ) {
          return question.question_id;
        }
      }
    }
  }
  
  return null;
};

/**
 * Gets all questions that come after a specific question in the same block
 * @param blocks All form blocks
 * @param blockId Block ID to check
 * @param questionId Question ID to start from
 * @returns Array of questions that come after the specified question
 */
export const getQuestionsAfterInBlock = (
  blocks: Block[],
  blockId: string,
  questionId: string
): Question[] => {
  const block = blocks.find(b => b.block_id === blockId);
  if (!block) return [];
  
  const questionIndex = block.questions.findIndex(q => q.question_id === questionId);
  if (questionIndex === -1 || questionIndex === block.questions.length - 1) return [];
  
  // Return all questions after the specified one in this block
  return block.questions.slice(questionIndex + 1);
};

/**
 * Gets the question text with styled responses for admin display
 * @param questionText The original question text
 * @param questionId The question ID
 * @param responseValue The response value from the database
 * @param placeholders The question placeholders (if available)
 * @returns Object with parts array containing text and styled response objects
 */
export const getQuestionTextWithStyledResponses = (
  questionText: string,
  questionId: string,
  responseValue: any,
  placeholders?: Record<string, any>
): { parts: Array<{type: 'text' | 'response', content: string, placeholderKey?: string}> } => {
  if (!questionText) return { parts: [{ type: 'text', content: '' }] };

  const parts: Array<{type: 'text' | 'response', content: string, placeholderKey?: string}> = [];
  
  let lastIndex = 0;
  const regex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = regex.exec(questionText)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: questionText.slice(lastIndex, match.index)
      });
    }

    const placeholderKey = match[1];
    let displayValue = "";
    
    // Try to get the response value for this placeholder
    if (responseValue && typeof responseValue === 'object') {
      // Check if we have a direct placeholder key match in the response object
      const responseForPlaceholder = responseValue[placeholderKey];
      
      if (responseForPlaceholder !== undefined && responseForPlaceholder !== null) {
        // Handle select type placeholders with options
        if (placeholders && placeholders[placeholderKey]?.type === "select" && !Array.isArray(responseForPlaceholder)) {
          const option = placeholders[placeholderKey].options?.find(
            (opt: any) => opt.id === responseForPlaceholder
          );
          displayValue = option ? option.label : responseForPlaceholder.toString();
        } else {
          // Handle other types (input, etc.)
          displayValue = Array.isArray(responseForPlaceholder) 
            ? responseForPlaceholder.join(", ") 
            : responseForPlaceholder.toString();
        }
      }
    }
    
    // If no response found, try to use the response value directly if it's a simple value
    if (!displayValue && responseValue && typeof responseValue !== 'object') {
      displayValue = responseValue.toString();
    }
    
    // Fallback to placeholder if no response found
    if (!displayValue) {
      displayValue = "____";
    }
    
    parts.push({
      type: 'response',
      content: displayValue,
      placeholderKey: placeholderKey
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < questionText.length) {
    parts.push({
      type: 'text',
      content: questionText.slice(lastIndex)
    });
  }

  // If no placeholders found, return the original text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content: questionText
    });
  }

  return { parts };
};
