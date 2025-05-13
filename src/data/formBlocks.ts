
// Questo file serve solo come re-export per mantenere la compatibilità con il codice esistente
// In futuro si dovrebbe aggiornare tutto il codice per utilizzare direttamente le importazioni da /blocks

import { allBlocks } from "./blocks";

// Re-esportiamo tutti i blocchi dal nuovo percorso organizzato
export { allBlocks };

// Re-esportiamo anche i singoli blocchi per mantenere la retrocompatibilità
export {
  block1,
  block2,
  block3,
  block4,
  block5,
  block6,
  block7,
  block8,
  block9,
  block10,
  block22,
  block23,
  block24,
  block25,
  block26,
  block27,
  blockStop
} from "./blocks";
