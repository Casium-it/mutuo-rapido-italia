
import { Block } from "@/types/form";
import { introduzione } from "./block1";
import { la_tua_situazione } from "./block2";
import { la_tua_professione } from "./block3";
import { reddito_lavoro_autonomo } from "./block4";
import { reddito_principale } from "./block5";
import { reddito_secondario } from "./block6";
import { finanziamenti } from "./block7";
import { la_tua_offerta } from "./block8";
import { casa_da_vendere } from "./block9";
import { conclusione } from "./block10";
import { la_tua_ricerca_casa } from "./block11";
import { la_casa_individuata } from "./block12";
import { manager_reddito_secondario } from "./block13";
import { manager_finanziamenti } from "./block14";
import { cointestatario } from "./block22";
import { la_sua_professione } from "./block23";
import { reddito_suo_autonomo } from "./block24";
import { reddito_suo_principale } from "./block25";
import { reddito_suo_secondario } from "./block26";
import { i_suoi_finanziamenti } from "./block27";
import { la_sua_da_vendere } from "./block28";
import { manager_finanziamenti_coint } from "./block29";
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
