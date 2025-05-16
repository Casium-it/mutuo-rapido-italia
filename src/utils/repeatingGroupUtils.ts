
import { RepeatingGroupEntry, RepeatingGroupEntries } from "@/types/form";

const STORAGE_KEY = "casium-repeating-groups";
const RESET_EVENT_NAME = "repeating-groups-reset";

/**
 * Ottiene tutti gli elementi salvati per tutti i gruppi ripetuti
 */
export const getAllRepeatingGroups = (): RepeatingGroupEntries => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    
    const parsed = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) {
      console.error("Invalid repeating groups data in localStorage");
      return {};
    }
    
    return parsed;
  } catch (error) {
    console.error("Failed to load repeating groups from localStorage:", error);
    return {};
  }
};

/**
 * Ottiene gli elementi per un gruppo ripetuto specifico
 */
export const getRepeatingGroupEntries = (repeatingId: string): RepeatingGroupEntry[] => {
  try {
    const allGroups = getAllRepeatingGroups();
    return Array.isArray(allGroups[repeatingId]) ? allGroups[repeatingId] : [];
  } catch (error) {
    console.error(`Failed to get entries for ${repeatingId}:`, error);
    return [];
  }
};

/**
 * Salva tutti gli elementi per un gruppo ripetuto
 */
export const saveRepeatingGroupEntries = (
  repeatingId: string,
  entries: RepeatingGroupEntry[]
): boolean => {
  try {
    const allGroups = getAllRepeatingGroups();
    allGroups[repeatingId] = entries;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allGroups));
    console.log(`Saved ${entries.length} entries for ${repeatingId}`);
    return true;
  } catch (error) {
    console.error(`Failed to save entries for ${repeatingId}:`, error);
    return false;
  }
};

/**
 * Aggiunge o aggiorna un elemento in un gruppo ripetuto
 */
export const saveRepeatingGroupEntry = (
  repeatingId: string,
  entry: RepeatingGroupEntry,
  index?: number
): boolean => {
  try {
    const entries = getRepeatingGroupEntries(repeatingId);
    
    // Se non abbiamo già un ID, generiamo un ID unico
    if (!entry.id) {
      entry.id = `${repeatingId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Se è specificato un indice, aggiorniamo quell'elemento, altrimenti aggiungiamo
    if (index !== undefined && index >= 0 && index < entries.length) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    
    return saveRepeatingGroupEntries(repeatingId, entries);
  } catch (error) {
    console.error(`Failed to save entry for ${repeatingId}:`, error);
    return false;
  }
};

/**
 * Elimina un elemento da un gruppo ripetuto
 */
export const deleteRepeatingGroupEntry = (
  repeatingId: string,
  idOrIndex: string | number
): boolean => {
  try {
    const entries = getRepeatingGroupEntries(repeatingId);
    
    let updatedEntries: RepeatingGroupEntry[];
    
    if (typeof idOrIndex === 'number') {
      // Elimina per indice
      if (idOrIndex < 0 || idOrIndex >= entries.length) {
        console.error(`Index ${idOrIndex} out of bounds for ${repeatingId}`);
        return false;
      }
      updatedEntries = entries.filter((_, i) => i !== idOrIndex);
    } else {
      // Elimina per ID
      updatedEntries = entries.filter(entry => entry.id !== idOrIndex);
    }
    
    return saveRepeatingGroupEntries(repeatingId, updatedEntries);
  } catch (error) {
    console.error(`Failed to delete entry from ${repeatingId}:`, error);
    return false;
  }
};

/**
 * Formatta il valore numerico come valuta Euro
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return "€0,00";
  
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(numValue);
};

/**
 * Ottiene l'etichetta leggibile per un ID di tipo di entrata
 */
export const getIncomeTypeLabel = (typeId: string): string => {
  const typeMap: Record<string, string> = {
    'rental': 'Reddito da affitto',
    'freelance': 'Lavoro autonomo',
    'child_support': 'Mantenimento figli',
    'allowance': 'Indennità',
    'dividends': 'Dividendi',
    'pension': 'Pensione',
    'other': 'Altro'
  };
  
  return typeMap[typeId] || 'Reddito aggiuntivo';
};

/**
 * Reimposta tutti i gruppi ripetuti (utile per il reset del modulo)
 * Ora dispatura anche un evento personalizzato per notificare le componenti
 */
export const resetAllRepeatingGroups = (): void => {
  try {
    // Rimuovi ESPLICITAMENTE tutti i dati dei gruppi ripetuti
    localStorage.removeItem(STORAGE_KEY);
    
    // Dispara un evento personalizzato per notificare le componenti
    const resetEvent = new CustomEvent(RESET_EVENT_NAME);
    window.dispatchEvent(resetEvent);
    
    console.log("All repeating groups have been reset and event dispatched");
  } catch (error) {
    console.error("Failed to reset repeating groups:", error);
  }
};

/**
 * Aggiunge un listener per l'evento di reset dei gruppi ripetuti
 */
export const addResetListener = (callback: () => void): () => void => {
  const handler = () => {
    console.log("Received repeating groups reset event");
    callback();
  };
  
  window.addEventListener(RESET_EVENT_NAME, handler);
  return () => window.removeEventListener(RESET_EVENT_NAME, handler);
};

/**
 * Dispara manualmente un evento di reset
 * Utile quando si vuole che tutte le componenti che usano repeatingGroups si aggiornino
 */
export const dispatchResetEvent = (): void => {
  const resetEvent = new CustomEvent(RESET_EVENT_NAME);
  window.dispatchEvent(resetEvent);
  console.log("Manual reset event dispatched for repeating groups");
};

/**
 * Verifica se esistono dati per i gruppi ripetuti nel localStorage
 */
export const hasRepeatingGroupData = (): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    
    const parsed = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) {
      return false;
    }
    
    return Object.keys(parsed).length > 0;
  } catch (error) {
    console.error("Failed to check repeating groups data:", error);
    return false;
  }
};
