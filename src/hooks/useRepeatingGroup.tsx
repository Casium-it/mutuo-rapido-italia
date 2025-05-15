
import { useState, useEffect, useCallback } from "react";
import { 
  getRepeatingGroupEntries, 
  saveRepeatingGroupEntry, 
  deleteRepeatingGroupEntry, 
  saveRepeatingGroupEntries,
  addResetListener,
  hasRepeatingGroupData
} from "@/utils/repeatingGroupUtils";
import { RepeatingGroupEntry } from "@/types/form";

export interface UseRepeatingGroupReturn {
  entries: RepeatingGroupEntry[];
  addEntry: (entry: RepeatingGroupEntry) => boolean;
  updateEntry: (entry: RepeatingGroupEntry, index: number) => boolean;
  deleteEntry: (idOrIndex: string | number) => boolean;
  resetEntries: () => void;
  loading: boolean;
  hasEntries: boolean;
  refreshEntries: () => void;
}

export function useRepeatingGroup(repeatingId: string): UseRepeatingGroupReturn {
  const [entries, setEntries] = useState<RepeatingGroupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Funzione per caricare le voci
  const loadEntries = useCallback(() => {
    try {
      setLoading(true);
      const loadedEntries = getRepeatingGroupEntries(repeatingId);
      setEntries(loadedEntries);
      console.log(`Loaded ${loadedEntries.length} entries for ${repeatingId}`);
    } catch (error) {
      console.error(`Error loading entries for ${repeatingId}:`, error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [repeatingId]);

  // Carica le voci quando il componente si monta o quando cambia repeatingId o forceUpdate
  useEffect(() => {
    loadEntries();
    
    // Aggiungiamo un listener per aggiornare gli elementi se cambiano in un'altra scheda
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'casium-repeating-groups') {
        loadEntries();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Aggiungi un listener per l'evento di reset specifico per react il repeating group
    const removeResetListener = addResetListener(() => {
      console.log(`Reset listener triggered for ${repeatingId}, reloading entries`);
      setEntries([]);
      loadEntries();
      // Forza un aggiornamento anche se loadEntries non trova modifiche
      setForceUpdate(prev => prev + 1);
    });
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      removeResetListener();
    };
  }, [repeatingId, loadEntries, forceUpdate]);

  // Aggiunge un nuovo elemento
  const addEntry = useCallback((entry: RepeatingGroupEntry): boolean => {
    const success = saveRepeatingGroupEntry(repeatingId, entry);
    if (success) {
      setEntries(prev => [...prev, { ...entry }]);
    }
    return success;
  }, [repeatingId]);

  // Aggiorna un elemento esistente
  const updateEntry = useCallback((entry: RepeatingGroupEntry, index: number): boolean => {
    const success = saveRepeatingGroupEntry(repeatingId, entry, index);
    if (success) {
      setEntries(prev => {
        const updated = [...prev];
        updated[index] = { ...entry };
        return updated;
      });
    }
    return success;
  }, [repeatingId]);

  // Elimina un elemento
  const deleteEntry = useCallback((idOrIndex: string | number): boolean => {
    const success = deleteRepeatingGroupEntry(repeatingId, idOrIndex);
    if (success) {
      setEntries(prev => {
        if (typeof idOrIndex === 'number') {
          return prev.filter((_, i) => i !== idOrIndex);
        } else {
          return prev.filter(entry => entry.id !== idOrIndex);
        }
      });
    }
    return success;
  }, [repeatingId]);

  // Reimposta tutte le voci
  const resetEntries = useCallback(() => {
    const success = saveRepeatingGroupEntries(repeatingId, []);
    if (success) {
      setEntries([]);
      // Forza un aggiornamento del componente
      setForceUpdate(prev => prev + 1);
    }
    return success;
  }, [repeatingId]);
  
  // Forza un aggiornamento delle voci
  const refreshEntries = useCallback(() => {
    loadEntries();
    // Forza un aggiornamento del componente anche se non ci sono modifiche
    setForceUpdate(prev => prev + 1);
  }, [loadEntries]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    resetEntries,
    loading,
    hasEntries: entries.length > 0,
    refreshEntries
  };
}
