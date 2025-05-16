
/**
 * Genera un ID univoco per un'istanza di sottoblocco
 */
export const generateInstanceId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * Ottiene un sommario testuale di un'istanza di sottoblocco
 * @param instance Istanza del sottoblocco
 * @param questions Domande del sottoblocco
 * @returns Stringa di testo riassuntiva
 */
export const getSubblockSummary = (
  instance: { responses: Record<string, Record<string, string | string[]>> },
  questions: { question_id: string; question_text: string; placeholders: Record<string, any> }[]
): string => {
  // Prendiamo la prima domanda che ha una risposta
  for (const question of questions) {
    const questionId = question.question_id;
    const response = instance.responses[questionId];
    
    if (response) {
      // Cerchiamo un placeholder con una risposta
      for (const [placeholderKey, value] of Object.entries(response)) {
        if (value && typeof value === 'string' && value.trim() !== '') {
          // Per semplicità, usiamo la prima risposta testuale trovata
          return value;
        } else if (Array.isArray(value) && value.length > 0) {
          return value.join(', ');
        }
      }
    }
  }
  
  return "Istanza senza descrizione";
};
