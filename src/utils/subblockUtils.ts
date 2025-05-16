
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
  // Per ogni domanda nel sottoblocco
  for (const question of questions) {
    const questionId = question.question_id;
    const response = instance.responses[questionId];
    
    if (response) {
      // Per ogni placeholder nella risposta
      for (const [placeholderKey, value] of Object.entries(response)) {
        if (value && typeof value === 'string' && value.trim() !== '') {
          // Se è una risposta di tipo input o una selezione diretta, la usiamo come sommario
          return value.trim();
        } else if (Array.isArray(value) && value.length > 0) {
          // Se è un array (multi-select), concateniamo i valori
          return value.join(', ');
        }
      }
    }
  }
  
  // Se non troviamo nessuna risposta testuale valida, proviamo a usare un placeholder di tipo select
  for (const question of questions) {
    const questionId = question.question_id;
    const response = instance.responses[questionId];
    
    if (response) {
      for (const [placeholderKey, value] of Object.entries(response)) {
        // Cerchiamo il placeholder corrispondente nella domanda
        const placeholder = question.placeholders[placeholderKey];
        if (placeholder && placeholder.type === "select" && typeof value === "string") {
          // Troviamo l'opzione selezionata
          const selectedOption = placeholder.options?.find((opt: any) => opt.id === value);
          if (selectedOption?.label) {
            return selectedOption.label;
          }
        }
      }
    }
  }
  
  return "Istanza senza descrizione";
};
