import { Block, Question, StandardBlock, RepeatingGroupBlock } from "@/types/form";

/**
 * Verifica se un blocco è di tipo StandardBlock
 * @param block Blocco da verificare
 * @returns true se è un StandardBlock, false altrimenti
 */
const isStandardBlock = (block: Block): block is StandardBlock => {
  return !('type' in block) || block.type !== 'repeating_group';
};

/**
 * Verifica se un blocco è di tipo RepeatingGroupBlock
 * @param block Blocco da verificare
 * @returns true se è un RepeatingGroupBlock, false altrimenti
 */
const isRepeatingGroupBlock = (block: Block): block is RepeatingGroupBlock => {
  return 'type' in block && block.type === 'repeating_group';
};

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
  if (!currentBlock || !isStandardBlock(currentBlock)) return undefined;

  const questionIndex = currentBlock.questions.findIndex(q => q.question_id === questionId);
  if (questionIndex <= 0) return undefined;

  return currentBlock.questions[questionIndex - 1];
};

/**
 * Gets a chain of all connected inline questions, starting from the first non-inline question
 * and including the specified question (unless includeCurrent is false)
 * 
 * Note: This function should ideally be used as a fallback when navigation history isn't available
 * 
 * @param blocks All form blocks
 * @param blockId Current block ID
 * @param questionId Current question ID
 * @param includeCurrent Whether to include the current question in the chain
 * @returns Array of questions in the chain, ordered from first to last
 */
export const getChainOfInlineQuestions = (
  blocks: Block[],
  blockId: string,
  questionId: string,
  includeCurrent: boolean = false
): Question[] => {
  const currentBlock = blocks.find(block => block.block_id === blockId);
  if (!currentBlock || !isStandardBlock(currentBlock)) return [];

  const questionIndex = currentBlock.questions.findIndex(q => q.question_id === questionId);
  if (questionIndex < 0) return [];

  const currentQuestion = currentBlock.questions[questionIndex];
  
  // Se questa è la prima domanda o non è inline, restituisci solo la domanda attuale
  if (questionIndex === 0 || !currentQuestion.inline) {
    return includeCurrent ? [currentQuestion] : [];
  }
  
  // Inizia la catena con la domanda precedente
  const chain: Question[] = [];
  let currentIndex = questionIndex - 1;
  
  // Continua ad aggiungere domande precedenti finché non troviamo una non inline
  while (currentIndex >= 0) {
    const question = currentBlock.questions[currentIndex];
    chain.unshift(question); // Aggiungi all'inizio dell'array
    
    // Se questa domanda non è inline, abbiamo raggiunto l'inizio della catena
    if (!question.inline) {
      break;
    }
    
    currentIndex--;
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
