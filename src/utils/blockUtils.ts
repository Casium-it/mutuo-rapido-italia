
import { Block } from "@/types/form";

/**
 * Verifica se un blocco ha la priorità impostata, altrimenti la imposta
 * in base al suo block_number
 */
export function ensureBlockHasPriority(block: Block): Block {
  if (typeof block.priority === "number") {
    return block;
  }
  
  // Altrimenti, assegna una priorità basata sul block_number
  const blockNum = parseInt(block.block_number, 10);
  
  // Gestisce numeri di blocchi speciali
  if (isNaN(blockNum) || blockNum > 100) {
    return {
      ...block,
      priority: 1000 // Priorità alta per blocchi speciali
    };
  }
  
  return {
    ...block,
    priority: blockNum * 10 // Moltiplica per 10 per avere spazio tra i blocchi
  };
}

/**
 * Ordina i blocchi per priorità
 */
export function sortBlocksByPriority(blocks: Block[]): Block[] {
  // Assicuriamoci prima che ogni blocco abbia una priorità valida
  const blocksWithPriority = blocks.map(block => ensureBlockHasPriority(block));
  
  // Ordina i blocchi per priorità
  return [...blocksWithPriority].sort((a, b) => a.priority - b.priority);
}

/**
 * Clona un blocco per la creazione di blocchi dinamici
 * @param block Il blocco da clonare
 * @param copyNumber Il numero di copia da usare per il blocco
 * @returns Un nuovo blocco copiato con ID aggiornati
 */
export function cloneBlockForDynamicCreation(block: Block, copyNumber: number): Block {
  // Clona profondamente il blocco
  const clonedBlock = JSON.parse(JSON.stringify(block));
  
  // Aggiorna l'ID del blocco e altri metadati
  const newBlockId = block.block_id.replace('{copyNumber}', copyNumber.toString());
  
  // Crea il nuovo blocco con i metadati aggiornati
  const newBlock: Block = {
    ...clonedBlock,
    block_id: newBlockId,
    blueprint_id: block.block_id,
    copy_number: copyNumber,
    title: `${block.title} ${copyNumber}`,
  };
  
  // Aggiorna gli ID delle domande
  newBlock.questions = newBlock.questions.map(question => ({
    ...question,
    question_id: question.question_id.replace('{copyNumber}', copyNumber.toString())
  }));
  
  return newBlock;
}

/**
 * Verifica se un blocco è un blueprint per blocchi dinamici
 * @param block Il blocco da verificare
 * @returns true se il blocco è un blueprint per blocchi dinamici
 */
export function isBlockBlueprint(block: Block): boolean {
  return block.multiBlock === true;
}
