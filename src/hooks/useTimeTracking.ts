
import { useEffect, useRef, useCallback } from 'react';
import { trackTimeMilestone, trackPageExit } from '@/utils/analytics';

interface UseTimeTrackingOptions {
  pageName: string;
  milestones?: number[]; // in seconds
}

// Default milestones outside the hook to prevent re-initialization
const DEFAULT_MILESTONES = [10, 30, 60, 120, 300]; // 10s, 30s, 1min, 2min, 5min

export const useTimeTracking = ({ 
  pageName, 
  milestones = DEFAULT_MILESTONES
}: UseTimeTrackingOptions) => {
  const startTimeRef = useRef<number>(0);
  const milestonesReachedRef = useRef<Set<number>>(new Set());
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const hasTrackedExitRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);

  const getTimeSpent = useCallback(() => {
    if (startTimeRef.current === 0) return 0;
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }, []);

  const trackExit = useCallback((exitType: string) => {
    if (hasTrackedExitRef.current || startTimeRef.current === 0) return;
    hasTrackedExitRef.current = true;
    
    const timeSpent = getTimeSpent();
    trackPageExit(pageName, exitType, timeSpent);
  }, [pageName, getTimeSpent]);

  // Initialize only once when component mounts
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    console.log(`🕒 Time tracking started for ${pageName}`);
    startTimeRef.current = Date.now();
    milestonesReachedRef.current.clear();
    hasTrackedExitRef.current = false;
    isInitializedRef.current = true;

    // Set up milestone timeouts
    milestones.forEach((milestone) => {
      const timeout = setTimeout(() => {
        if (!milestonesReachedRef.current.has(milestone)) {
          milestonesReachedRef.current.add(milestone);
          trackTimeMilestone(pageName, milestone);
        }
      }, milestone * 1000);
      
      timeoutsRef.current.push(timeout);
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackExit('tab_switch');
      }
    };

    // Track page unload
    const handleBeforeUnload = () => {
      trackExit('page_close');
    };

    // Track navigation away from page
    const handlePopState = () => {
      trackExit('navigate');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      // Clear all timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);

      // Track final exit if we haven't already
      if (!hasTrackedExitRef.current) {
        trackExit('navigate');
      }

      console.log(`🕒 Time tracking stopped for ${pageName}. Total time: ${getTimeSpent()}s`);
      isInitializedRef.current = false;
    };
  }, [pageName]); // Only depend on pageName, not on milestones or callbacks

  return {
    getTimeSpent,
    trackCustomExit: trackExit
  };
};
