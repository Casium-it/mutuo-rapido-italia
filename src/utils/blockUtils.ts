
import { Block } from "@/types/form";

/**
 * Crea una copia profonda di un blocco modificando gli ID per evitare conflitti
 * @param sourceBlock Il blocco sorgente da copiare
 * @param copyIndex Indice di copia per generare nuovi ID unici
 * @returns Una nuova istanza del blocco con ID unici
 */
export function deepCloneBlock(sourceBlock: Block, copyIndex: number): Block {
  // Crea un nuovo ID basato sul blocco sorgente e sull'indice di copia
  const newBlockId = `${sourceBlock.block_id}_copy${copyIndex}`;
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
    const newQuestionId = `${question.question_id}_copy${copyIndex}`;
    
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
              leads_to: `${option.leads_to}_copy${copyIndex}`
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
          placeholder.leads_to = `${placeholder.leads_to}_copy${copyIndex}`;
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

/**
 * Genera un ID univoco per le copie dei blocchi
 * @param sourceBlockId ID del blocco sorgente
 * @param existingCopies Array di ID dei blocchi già copiati
 * @returns Indice da utilizzare per la nuova copia
 */
export function generateUniqueBlockIndex(sourceBlockId: string, existingCopies: string[]): number {
  // Se non ci sono copie esistenti, inizia da 1
  if (existingCopies.length === 0) {
    return 1;
  }
  
  // Trova il massimo indice attualmente utilizzato
  let maxIndex = 0;
  
  existingCopies.forEach(blockId => {
    // Estrai l'indice dalla fine dell'ID (formato: sourceBlockId_copyX)
    const match = blockId.match(/_copy(\d+)$/);
    if (match) {
      const index = parseInt(match[1], 10);
      if (index > maxIndex) {
        maxIndex = index;
      }
    }
  });
  
  // Usa il massimo indice trovato + 1
  return maxIndex + 1;
}

/**
 * Verifica la coerenza tra il registro dei blocchi copiati e i blocchi effettivamente esistenti
 * @param blockCopyRegistry Il registro dei blocchi copiati
 * @param blocks Tutti i blocchi disponibili
 * @returns Un registro corretto e riparato
 */
export function validateBlockCopyRegistry(blockCopyRegistry: Record<string, string[]>, blocks: Block[]): Record<string, string[]> {
  const validatedRegistry: Record<string, string[]> = {};
  const existingBlockIds = blocks.map(b => b.block_id);
  
  // Per ogni fonte nel registro
  Object.keys(blockCopyRegistry).forEach(sourceId => {
    // Filtra solo i blocchi che esistono effettivamente
    const validCopies = blockCopyRegistry[sourceId].filter(
      copyId => existingBlockIds.includes(copyId)
    );
    
    if (validCopies.length > 0) {
      validatedRegistry[sourceId] = validCopies;
    }
  });
  
  // Cerca anche blocchi con is_copy_of che potrebbero non essere nel registro
  blocks.forEach(block => {
    if (block.is_copy_of) {
      if (!validatedRegistry[block.is_copy_of]) {
        validatedRegistry[block.is_copy_of] = [];
      }
      
      if (!validatedRegistry[block.is_copy_of].includes(block.block_id)) {
        validatedRegistry[block.is_copy_of].push(block.block_id);
      }
    }
  });
  
  return validatedRegistry;
}
