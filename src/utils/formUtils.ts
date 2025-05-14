import { Question, FormResponse } from "@/types/form";

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
