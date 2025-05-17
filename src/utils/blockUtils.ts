
import { Block } from "@/types/form";

/**
 * Crea una copia profonda di un blocco modificando gli ID per evitare conflitti
 * @param sourceBlock Il blocco sorgente da copiare
 * @param copyIndex Indice di copia per generare nuovi ID unici
 * @returns Una nuova istanza del blocco con ID unici
 */
export function deepCloneBlock(sourceBlock: Block, copyIndex: number): Block {
  // Crea un nuovo ID basato sul blocco sorgente e sull'indice di copia
  const newBlockId = `${sourceBlock.block_id}_id${copyIndex}`;
  console.log(`deepCloneBlock: Creando blocco ${newBlockId} con indice ${copyIndex}`);
  
  // Crea una copia profonda del blocco
  const newBlock: Block = {
    ...JSON.parse(JSON.stringify(sourceBlock)),
    block_id: newBlockId,
    // Aggiungiamo metadati per tracciare l'origine della copia
    is_copy_of: sourceBlock.block_id,
    copy_index: copyIndex,
  };
  
  // Aggiorna gli ID delle domande e i riferimenti interni
  newBlock.questions = newBlock.questions.map(question => {
    // Creiamo un nuovo ID per la domanda basato sull'ID originale e sull'indice di copia
    const newQuestionId = `${question.question_id}_id${copyIndex}`;
    
    // Aggiorna i riferimenti nei placeholder
    const updatedPlaceholders = { ...question.placeholders };
    
    // Analizza ogni placeholder
    Object.keys(updatedPlaceholders).forEach(placeholderKey => {
      const placeholder = updatedPlaceholders[placeholderKey];
      
      // Per i placeholder di tipo select, aggiorna i riferimenti interni
      if (placeholder.type === "select") {
        placeholder.options = placeholder.options.map(option => {
          // Gestisci i marcatori speciali per riferimenti a domande parent
          if (option.leads_to && option.leads_to.startsWith("[[PARENT:") && option.leads_to.endsWith("]]")) {
            // Estrai l'ID della domanda parent
            const parentQuestionId = option.leads_to.substring(9, option.leads_to.length - 2);
            return {
              ...option,
              leads_to: parentQuestionId
            };
          } 
          // Gestisci riferimenti a domande all'interno dello stesso blocco
          else if (option.leads_to && sourceBlock.questions.some(q => q.question_id === option.leads_to)) {
            return {
              ...option,
              leads_to: `${option.leads_to}_id${copyIndex}`
            };
          }
          return option;
        });
      }
      // Per i placeholder di tipo input, verifica i riferimenti
      else if (placeholder.type === "input" && placeholder.leads_to) {
        // Gestisci i marcatori speciali per riferimenti a domande parent
        if (placeholder.leads_to.startsWith("[[PARENT:") && placeholder.leads_to.endsWith("]]")) {
          // Estrai l'ID della domanda parent
          placeholder.leads_to = placeholder.leads_to.substring(9, placeholder.leads_to.length - 2);
        }
        // Gestisci riferimenti a domande all'interno dello stesso blocco
        else if (sourceBlock.questions.some(q => q.question_id === placeholder.leads_to)) {
          placeholder.leads_to = `${placeholder.leads_to}_id${copyIndex}`;
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
