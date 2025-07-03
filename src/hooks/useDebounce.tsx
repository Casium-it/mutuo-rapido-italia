import { useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook that debounces a callback function
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @param dependencies - Array of dependencies that trigger the callback
 */
export function useDebounce(
  callback: () => void,
  delay: number,
  dependencies: any[]
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup function to cancel pending debounced calls
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Debounced effect
  useEffect(() => {
    // Clear any existing timeout
    cleanup();
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);

    // Cleanup on unmount or dependency change
    return cleanup;
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
}