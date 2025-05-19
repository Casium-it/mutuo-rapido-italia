
import { Block } from "@/types/form";
import { introduzione } from "./introduzione";
import { la_tua_situazione } from "./la_tua_situazione";
import { la_tua_professione } from "./block3";
import { reddito_lavoro_autonomo } from "./block4";
import { reddito_principale } from "./block5";
import { reddito_secondario } from "./block6";
import { finanziamenti } from "./block7";
import { la_tua_offerta } from "./block8";
import { casa_da_vendere } from "./block9";
import { conclusione } from "./conclusione";
import { la_tua_ricerca_casa } from "./la_tua_ricerca_casa";
import { la_casa_individuata } from "./la_casa_individuata";
import { manager_reddito_secondario } from "./manager_reddito_secondario";
import { manager_finanziamenti } from "./manager_finanziamenti";
import { cointestatario } from "./block22";
import { la_sua_professione } from "./block23";
import { reddito_suo_autonomo } from "./reddito_suo_autonomo";
import { reddito_suo_principale } from "./block25";
import { reddito_suo_secondario } from "./reddito_suo_secondario";
import { i_suoi_finanziamenti } from "./i_suoi_finanziamenti";
import { la_sua_da_vendere } from "./la_sua_da_vendere";
import { manager_finanziamenti_coint } from "./manager_finanziamenti_coint";
import { stop_flow } from "./blockStop";
import { dettagli_reddito_secondario } from "./blockDettagliRedditoSecondario";

// Esportare tutti i blocchi individualmente
export {
  introduzione,
  la_tua_situazione,
  la_tua_professione,
  reddito_lavoro_autonomo,
  reddito_principale,
  reddito_secondario,
  finanziamenti,
  la_tua_offerta,
  casa_da_vendere,
  conclusione,
  la_tua_ricerca_casa,
  la_casa_individuata,
  manager_reddito_secondario,
  manager_finanziamenti,
  cointestatario,
  la_sua_professione,
  reddito_suo_autonomo,
  reddito_suo_principale,
  reddito_suo_secondario,
  i_suoi_finanziamenti,
  la_sua_da_vendere,
  manager_finanziamenti_coint,
  stop_flow,
  dettagli_reddito_secondario
};

// Esportare l'array completo di tutti i blocchi, ordinato per priorità
export const allBlocks: Block[] = [
  introduzione,
  la_tua_situazione,
  la_tua_professione,
  reddito_lavoro_autonomo,
  reddito_principale,
  reddito_secondario,
  finanziamenti,
  la_tua_offerta,
  casa_da_vendere,
  conclusione,
  la_tua_ricerca_casa,
  la_casa_individuata,
  manager_reddito_secondario,
  manager_finanziamenti,
  cointestatario,
  la_sua_professione,
  reddito_suo_autonomo,
  reddito_suo_principale,
  reddito_suo_secondario,
  i_suoi_finanziamenti,
  la_sua_da_vendere,
  manager_finanziamenti_coint,
  stop_flow,
  dettagli_reddito_secondario
].sort((a, b) => a.priority - b.priority); // Ordina i blocchi per priorità
