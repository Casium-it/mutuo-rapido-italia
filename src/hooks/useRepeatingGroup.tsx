
import { useState, useEffect, useCallback } from "react";
import { RepeatingGroupEntry } from "@/types/form";
import { useForm } from "@/contexts/FormContext";
import { addResetListener } from "@/utils/repeatingGroupUtils";

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
  // Ottieni le funzioni e lo stato dal FormContext
  const { getRepeatingGroupEntries, saveRepeatingGroupEntry, deleteRepeatingGroupEntry } = useForm();
  
  // Stato locale per le voci (sincronizzato con il FormContext)
  const [entries, setEntries] = useState<RepeatingGroupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Funzione per caricare le voci dal FormContext
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
  }, [repeatingId, getRepeatingGroupEntries]);

  // Carica le voci quando il componente si monta o quando cambia repeatingId o forceUpdate
  useEffect(() => {
    loadEntries();
    
    // Aggiungi un listener per l'evento di reset specifico per il repeating group
    const removeResetListener = addResetListener(() => {
      console.log(`Reset listener triggered for ${repeatingId}, reloading entries`);
      setEntries([]);
      loadEntries();
      // Forza un aggiornamento anche se loadEntries non trova modifiche
      setForceUpdate(prev => prev + 1);
    });
    
    return () => {
      removeResetListener();
    };
  }, [repeatingId, loadEntries, forceUpdate]);

  // Aggiunge un nuovo elemento
  const addEntry = useCallback((entry: RepeatingGroupEntry): boolean => {
    const success = saveRepeatingGroupEntry(repeatingId, entry);
    if (success) {
      // Aggiorna lo stato locale
      setEntries(prev => [...prev, { ...entry }]);
    }
    return success;
  }, [repeatingId, saveRepeatingGroupEntry]);

  // Aggiorna un elemento esistente
  const updateEntry = useCallback((entry: RepeatingGroupEntry, index: number): boolean => {
    const success = saveRepeatingGroupEntry(repeatingId, entry, index);
    if (success) {
      // Aggiorna lo stato locale
      setEntries(prev => {
        const updated = [...prev];
        updated[index] = { ...entry };
        return updated;
      });
    }
    return success;
  }, [repeatingId, saveRepeatingGroupEntry]);

  // Elimina un elemento
  const deleteEntry = useCallback((idOrIndex: string | number): boolean => {
    const success = deleteRepeatingGroupEntry(repeatingId, idOrIndex);
    if (success) {
      // Aggiorna lo stato locale
      setEntries(prev => {
        if (typeof idOrIndex === 'number') {
          return prev.filter((_, i) => i !== idOrIndex);
        } else {
          return prev.filter(entry => entry.id !== idOrIndex);
        }
      });
    }
    return success;
  }, [repeatingId, deleteRepeatingGroupEntry]);

  // Reimposta tutte le voci
  const resetEntries = useCallback(() => {
    // Imposta un array vuoto nel repeating group
    const success = saveRepeatingGroupEntry(repeatingId, [] as any);
    if (success) {
      setEntries([]);
      // Forza un aggiornamento del componente
      setForceUpdate(prev => prev + 1);
    }
    return success;
  }, [repeatingId, saveRepeatingGroupEntry]);
  
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
