
import { Question, FormResponse, Block } from "@/types/form";

export function getQuestionTextWithClickableResponses(question: Question, responses: FormResponse) {
  const parts: Array<{ type: 'text' | 'response'; content: string; placeholderKey?: string }> = [];
  let lastIndex = 0;
  const regex = /\{\{([^}]+)\}\}/g;
  let match;
  let placeholderKeys: string[] = [];

  // Otteniamo le risposte per questa domanda
  const questionResponses = responses[question.question_id] || {};

  while ((match = regex.exec(question.question_text)) !== null) {
    // Aggiungi il testo prima del placeholder
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: question.question_text.slice(lastIndex, match.index)
      });
    }

    const placeholderKey = match[1];
    placeholderKeys.push(placeholderKey);

    // Se abbiamo una risposta per questo placeholder, mostrarla come cliccabile
    if (questionResponses[placeholderKey]) {
      let displayValue = '';

      // Determina il valore da mostrare in base al tipo di placeholder
      if (question.placeholders[placeholderKey]?.type === 'select') {
        // Per i select, mostra l'etichetta dell'opzione selezionata
        const options = (question.placeholders[placeholderKey] as any).options || [];
        const selectedOption = options.find((opt: any) => opt.id === questionResponses[placeholderKey]);
        
        displayValue = selectedOption ? selectedOption.label : String(questionResponses[placeholderKey]);
      } else {
        // Per altri tipi (come input), mostra il valore direttamente
        displayValue = String(questionResponses[placeholderKey]);
      }

      parts.push({
        type: 'response',
        content: displayValue,
        placeholderKey: placeholderKey // Aggiungi il placeholderKey per identificarlo al click
      });
    } else {
      // Se non c'è risposta, mostra il placeholder vuoto
      parts.push({
        type: 'text',
        content: `{{${placeholderKey}}}`
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Aggiungi il resto del testo
  if (lastIndex < question.question_text.length) {
    parts.push({
      type: 'text',
      content: question.question_text.slice(lastIndex)
    });
  }

  return { parts, placeholderKeys };
}

// Aggiungi funzione per recuperare la domanda precedente
export function getPreviousQuestion(blocks: Block[], currentBlockId: string, currentQuestionId: string): Question | undefined {
  let foundPrevious = false;
  let previousQuestion: Question | undefined = undefined;
  
  // Cerca nei blocchi fino a trovare quello attuale
  for (const block of blocks) {
    if (block.block_id === currentBlockId) {
      // Trova la domanda corrente e quella precedente nello stesso blocco
      for (let i = 0; i < block.questions.length; i++) {
        if (block.questions[i].question_id === currentQuestionId) {
          // Se non è la prima domanda del blocco, la precedente è nel blocco stesso
          if (i > 0) {
            previousQuestion = block.questions[i - 1];
          }
          foundPrevious = true;
          break;
        }
        // Salva la domanda corrente come potenziale predecessore
        previousQuestion = block.questions[i];
      }
      
      // Se abbiamo trovato la domanda corrente, termina la ricerca
      if (foundPrevious) break;
      
      // Reset se non abbiamo trovato la domanda in questo blocco
      previousQuestion = undefined;
    } 
    // Se abbiamo già trovato il blocco corrente ma non la domanda, 
    // la precedente è l'ultima del blocco precedente
    else if (foundPrevious && block.questions.length > 0) {
      previousQuestion = block.questions[block.questions.length - 1];
      break;
    }
  }
  
  return previousQuestion;
}

// Aggiungi funzione per riempire il testo della domanda con le risposte
export function getQuestionTextWithResponses(question: Question, responses: FormResponse): string {
  let text = question.question_text;
  const questionResponses = responses[question.question_id] || {};
  
  // Sostituisci i placeholder con le risposte
  Object.keys(questionResponses).forEach(key => {
    const value = questionResponses[key];
    if (value) {
      // Per i select, usa l'etichetta dell'opzione
      if (question.placeholders[key]?.type === 'select') {
        const options = (question.placeholders[key] as any).options || [];
        const selectedOption = options.find((opt: any) => opt.id === value);
        
        if (selectedOption) {
          text = text.replace(`{{${key}}}`, selectedOption.label);
        } else {
          text = text.replace(`{{${key}}}`, String(value));
        }
      } else {
        // Per gli input, usa il valore direttamente
        text = text.replace(`{{${key}}}`, String(value));
      }
    }
  });
  
  return text;
}

// Aggiungi funzione per ottenere una catena di domande inline
export function getChainOfInlineQuestions(blocks: Block[], currentBlockId: string, currentQuestionId: string): Question[] {
  const result: Question[] = [];
  let currentBlock = blocks.find(b => b.block_id === currentBlockId);
  
  if (!currentBlock) return result;
  
  // Trova l'indice della domanda corrente nel blocco
  const currentQuestionIndex = currentBlock.questions.findIndex(
    q => q.question_id === currentQuestionId
  );
  
  if (currentQuestionIndex === -1) return result;
  
  // Controlla se la domanda corrente è inline
  const currentQuestion = currentBlock.questions[currentQuestionIndex];
  if (currentQuestion.inline !== true) return result;
  
  // Trova la prima domanda non inline che precede la corrente
  let i = currentQuestionIndex - 1;
  const chainQuestions: Question[] = [];
  
  // Aggiungi le domande inline che precedono la corrente
  while (i >= 0) {
    const q = currentBlock.questions[i];
    if (!q.inline) {
      // Abbiamo trovato la prima domanda non inline
      chainQuestions.unshift(q);
      break;
    }
    chainQuestions.unshift(q);
    i--;
  }
  
  // Se non abbiamo trovato alcuna domanda non inline, restituisci un array vuoto
  if (chainQuestions.length === 0 && i < 0) {
    return result;
  }
  
  // Aggiungi tutte le domande inline intermedie fino alla domanda corrente (esclusa)
  for (let j = i + 1; j < currentQuestionIndex; j++) {
    chainQuestions.push(currentBlock.questions[j]);
  }
  
  return chainQuestions;
}
