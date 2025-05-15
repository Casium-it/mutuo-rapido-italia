
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
  // Get functions and state from FormContext
  const { getRepeatingGroupEntries, saveRepeatingGroupEntry, deleteRepeatingGroupEntry } = useForm();
  
  // Local state for entries (synchronized with FormContext)
  const [entries, setEntries] = useState<RepeatingGroupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Function to load entries from FormContext
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

  // Load entries when the component mounts or when repeatingId or forceUpdate changes
  useEffect(() => {
    loadEntries();
    
    // Add a listener for the reset event specific to the repeating group
    const removeResetListener = addResetListener(() => {
      console.log(`Reset listener triggered for ${repeatingId}, reloading entries`);
      setEntries([]);
      loadEntries();
      // Force an update even if loadEntries doesn't find any changes
      setForceUpdate(prev => prev + 1);
    });
    
    return () => {
      removeResetListener();
    };
  }, [repeatingId, loadEntries, forceUpdate]);

  // Add a new entry
  const addEntry = useCallback((entry: RepeatingGroupEntry): boolean => {
    const success = saveRepeatingGroupEntry(repeatingId, entry);
    if (success) {
      // Update local state
      setEntries(prev => [...prev, { ...entry }]);
    }
    return success;
  }, [repeatingId, saveRepeatingGroupEntry]);

  // Update an existing entry
  const updateEntry = useCallback((entry: RepeatingGroupEntry, index: number): boolean => {
    const success = saveRepeatingGroupEntry(repeatingId, entry, index);
    if (success) {
      // Update local state
      setEntries(prev => {
        const updated = [...prev];
        updated[index] = { ...entry };
        return updated;
      });
    }
    return success;
  }, [repeatingId, saveRepeatingGroupEntry]);

  // Delete an entry
  const deleteEntry = useCallback((idOrIndex: string | number): boolean => {
    const success = deleteRepeatingGroupEntry(repeatingId, idOrIndex);
    if (success) {
      // Update local state
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

  // Reset all entries
  const resetEntries = useCallback(() => {
    // Set an empty array in the repeating group
    const success = saveRepeatingGroupEntry(repeatingId, [] as any);
    if (success) {
      setEntries([]);
      // Force a component update
      setForceUpdate(prev => prev + 1);
    }
    return success;
  }, [repeatingId, saveRepeatingGroupEntry]);
  
  // Force an update of entries
  const refreshEntries = useCallback(() => {
    loadEntries();
    // Force a component update even if there are no changes
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
