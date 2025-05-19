
import { Block } from "@/types/form";
import { introduzione } from "./introduzione";
import { la_tua_situazione } from "./la_tua_situazione";
import { la_tua_professione } from "./la_tua_professione";
import { reddito_lavoro_autonomo } from "./reddito_lavoro_autonomo";
import { reddito_principale } from "./reddito_principale";
import { reddito_secondario } from "./reddito_secondario";
import { reddito_secondario_blueprint } from "./reddito_secondario_blueprint";
import { finanziamenti } from "./finanziamenti";
import { finanziamenti_blueprint } from "./finanziamenti_blueprint";
import { la_tua_ricerca_casa } from "./la_tua_ricerca_casa";
import { la_casa_individuata } from "./la_casa_individuata";
import { la_tua_offerta } from "./la_tua_offerta";
import { casa_da_vendere } from "./casa_da_vendere";

// Esportare tutti i blocchi individualmente
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

// Esportare l'array completo di tutti i blocchi, ordinato per priorità
export const allBlocks: Block[] = [
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
].sort((a, b) => a.priority - b.priority); // Ordina i blocchi per priorità
