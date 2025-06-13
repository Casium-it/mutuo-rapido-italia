
import { useEffect, useRef } from 'react';
import { trackEvent } from '@/utils/analytics';

interface TimeTrackingData {
  totalTime: number;
  visibleTime: number;
  exitMethod: 'navigation' | 'close' | 'beforeunload';
  engagementMilestones: number[];
}

export const useHomePageTimeTracking = () => {
  const startTimeRef = useRef<number>(0);
  const visibleTimeRef = useRef<number>(0);
  const lastVisibilityChangeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(!document.hidden);
  const milestonesReachedRef = useRef<Set<number>>(new Set());
  const hasTrackedRef = useRef<boolean>(false);

  const sendTimeTrackingData = (exitMethod: 'navigation' | 'close' | 'beforeunload') => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    const currentTime = performance.now();
    const totalTime = Math.round((currentTime - startTimeRef.current) / 1000);
    
    // Add final visible time if currently visible
    if (isVisibleRef.current) {
      visibleTimeRef.current += currentTime - lastVisibilityChangeRef.current;
    }
    
    const visibleTime = Math.round(visibleTimeRef.current / 1000);
    
    const trackingData: TimeTrackingData = {
      totalTime,
      visibleTime,
      exitMethod,
      engagementMilestones: Array.from(milestonesReachedRef.current)
    };

    // Track the event
    trackEvent('home_page_time_spent', {
      total_time_seconds: totalTime,
      visible_time_seconds: visibleTime,
      exit_method: exitMethod,
      engagement_milestones: trackingData.engagementMilestones.join(','),
      engagement_rate: totalTime > 0 ? Math.round((visibleTime / totalTime) * 100) : 0
    });

    console.log('Home page time tracking:', trackingData);
  };

  const checkEngagementMilestones = () => {
    const currentTime = performance.now();
    const totalSeconds = Math.floor((currentTime - startTimeRef.current) / 1000);
    
    const milestones = [10, 30, 60, 120, 300]; // 10s, 30s, 1min, 2min, 5min
    
    milestones.forEach(milestone => {
      if (totalSeconds >= milestone && !milestonesReachedRef.current.has(milestone)) {
        milestonesReachedRef.current.add(milestone);
        trackEvent('home_page_engagement_milestone', {
          milestone_seconds: milestone,
          total_time_so_far: totalSeconds
        });
      }
    });
  };

  useEffect(() => {
    // Initialize tracking
    startTimeRef.current = performance.now();
    lastVisibilityChangeRef.current = startTimeRef.current;

    // Handle visibility changes
    const handleVisibilityChange = () => {
      const currentTime = performance.now();
      
      if (document.hidden) {
        // Page became hidden - add visible time
        if (isVisibleRef.current) {
          visibleTimeRef.current += currentTime - lastVisibilityChangeRef.current;
        }
        isVisibleRef.current = false;
      } else {
        // Page became visible - reset timer
        isVisibleRef.current = true;
        lastVisibilityChangeRef.current = currentTime;
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      sendTimeTrackingData('beforeunload');
    };

    // Set up milestone checking interval
    const milestoneInterval = setInterval(checkEngagementMilestones, 5000); // Check every 5 seconds

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Clean up
      clearInterval(milestoneInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Send final tracking data if not already sent
      if (!hasTrackedRef.current) {
        sendTimeTrackingData('close');
      }
    };
  }, []);

  // Return function to manually track navigation
  const trackNavigation = () => {
    sendTimeTrackingData('navigation');
  };

  return { trackNavigation };
};
