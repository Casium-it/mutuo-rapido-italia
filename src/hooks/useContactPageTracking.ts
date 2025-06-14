
import { useEffect, useRef } from 'react';
import { trackSimulationLostDetails } from '@/utils/analytics';

export const useContactPageTracking = () => {
  const pageStartTimeRef = useRef<number>(0);

  useEffect(() => {
    // Record page start time
    pageStartTimeRef.current = Date.now();

    // Track page exit if user leaves without submitting
    const handleBeforeUnload = () => {
      const pageTimeSeconds = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
      trackSimulationLostDetails(pageTimeSeconds);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const pageTimeSeconds = Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
        trackSimulationLostDetails(pageTimeSeconds);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getPageTime = () => {
    return Math.floor((Date.now() - pageStartTimeRef.current) / 1000);
  };

  return { getPageTime };
};
