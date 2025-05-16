
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
  // Questo assicura che tutte le domande abbiano ID unici nel form
  newBlock.questions = newBlock.questions.map(question => {
    // Assicuriamo che il question_id sia unico aggiungendo il prefisso del blocco
    // Però manteniamo la parte finale dell'ID originale per leggibilità
    const originalQuestionIdParts = question.question_id.split('_');
    const questionBase = originalQuestionIdParts.length > 1 
      ? originalQuestionIdParts.slice(1).join('_') 
      : originalQuestionIdParts[0];
    
    return {
      ...question,
      block_id: newBlockId, // Aggiorniamo il riferimento al blocco
      question_id: `${newBlockId}_${questionBase}` // Creiamo un nuovo ID univoco
    };
  });
  
  return newBlock;
}
