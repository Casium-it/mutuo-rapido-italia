
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
  return [...blocks].sort((a, b) => a.priority - b.priority);
}
