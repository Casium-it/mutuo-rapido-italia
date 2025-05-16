
import { Block } from "@/types/form";

/**
 * Crea una copia profonda di un blocco modificando gli ID per evitare conflitti
 * @param sourceBlock Il blocco sorgente da copiare
 * @param copyIndex Indice di copia per generare nuovi ID unici
 * @returns Una nuova istanza del blocco con ID unici
 */
export function deepCloneBlock(sourceBlock: Block, copyIndex: number): Block {
  // Crea un nuovo ID basato sul blocco sorgente e sull'indice di copia
  const newBlockId = `${sourceBlock.block_id}_copy_${copyIndex}`;
  
  // Crea una copia profonda del blocco
  const newBlock: Block = {
    ...JSON.parse(JSON.stringify(sourceBlock)),
    block_id: newBlockId,
    // Aggiungiamo metadati per tracciare l'origine della copia
    is_copy_of: sourceBlock.block_id,
    copy_index: copyIndex,
  };
  
  // Aggiorna gli ID delle domande per includervi il nuovo block_id
  newBlock.questions = newBlock.questions.map(question => {
    // Assicuriamo che il question_id sia unico aggiungendo il prefisso del blocco
    const originalQuestionIdParts = question.question_id.split('_');
    const questionBase = originalQuestionIdParts.length > 1 
      ? originalQuestionIdParts.slice(1).join('_') 
      : originalQuestionIdParts[0];
    
    const newQuestionId = `${newBlockId}_${questionBase}`;
    
    // Aggiorna anche i valori leads_to nelle opzioni dei placeholder se si riferiscono a domande all'interno dello stesso blocco
    const updatedPlaceholders = { ...question.placeholders };
    
    // Analizza ogni placeholder
    Object.keys(updatedPlaceholders).forEach(placeholderKey => {
      const placeholder = updatedPlaceholders[placeholderKey];
      
      // Per i placeholder di tipo select, aggiorna i leads_to che puntano a domande interne
      if (placeholder.type === "select") {
        placeholder.options = placeholder.options.map(option => {
          // Se leads_to è una domanda all'interno dello stesso blocco, aggiorna il riferimento
          if (option.leads_to && sourceBlock.questions.some(q => q.question_id === option.leads_to)) {
            const targetQuestion = option.leads_to.split('_').pop();
            return {
              ...option,
              leads_to: `${newBlockId}_${targetQuestion}`
            };
          }
          return option;
        });
      }
      // Per i placeholder di tipo input, verifica se leads_to punta a domande interne
      else if (placeholder.type === "input" && placeholder.leads_to) {
        if (sourceBlock.questions.some(q => q.question_id === placeholder.leads_to)) {
          const targetQuestion = placeholder.leads_to.split('_').pop();
          placeholder.leads_to = `${newBlockId}_${targetQuestion}`;
        }
      }
    });
    
    return {
      ...question,
      block_id: newBlockId,
      question_id: newQuestionId,
      placeholders: updatedPlaceholders
    };
  });
  
  return newBlock;
}
