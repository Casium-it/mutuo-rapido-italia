
import { useRef, useCallback } from 'react';

// Global simulation timer that persists across component re-renders and navigation
let globalSimulationStartTime: number | null = null;

export const useSimulationTimer = () => {
  const isInitializedRef = useRef(false);

  // Initialize the global timer only once when first called
  const initializeTimer = useCallback(() => {
    if (!isInitializedRef.current && globalSimulationStartTime === null) {
      globalSimulationStartTime = Date.now();
      isInitializedRef.current = true;
      console.log('🏁 Global simulation timer started');
    }
  }, []);

  // Get total time spent since simulation start
  const getTotalTimeSpent = useCallback(() => {
    if (globalSimulationStartTime === null) return 0;
    return Math.floor((Date.now() - globalSimulationStartTime) / 1000);
  }, []);

  // Reset the global timer (for testing or new simulations)
  const resetTimer = useCallback(() => {
    globalSimulationStartTime = null;
    isInitializedRef.current = false;
    console.log('🔄 Global simulation timer reset');
  }, []);

  return {
    initializeTimer,
    getTotalTimeSpent,
    resetTimer
  };
};
