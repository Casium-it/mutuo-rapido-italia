
// Questo file serve solo come re-export per mantenere la compatibilità con il codice esistente
// In futuro si dovrebbe aggiornare tutto il codice per utilizzare direttamente le importazioni da /blocks

import { allBlocks } from "./blocks";
import {
  introduzione,
  la_tua_situazione,
  la_tua_professione,
  reddito_lavoro_autonomo,
  reddito_principale,
  reddito_secondario,
  reddito_secondario_blueprint,
  finanziamenti,
  finanziamenti_blueprint,
  la_tua_ricerca_casa,
  la_casa_individuata,
  la_tua_offerta,
  casa_da_vendere
} from "./blocks";

// Re-esportiamo tutti i blocchi dal nuovo percorso organizzato
export { allBlocks };

// Re-esportiamo anche i singoli blocchi per mantenere la retrocompatibilità
export {
  introduzione,
  la_tua_situazione,
  la_tua_professione,
  reddito_lavoro_autonomo,
  reddito_principale,
  reddito_secondario,
  reddito_secondario_blueprint,
  finanziamenti,
  finanziamenti_blueprint,
  la_tua_ricerca_casa,
  la_casa_individuata,
  la_tua_offerta,
  casa_da_vendere
};
