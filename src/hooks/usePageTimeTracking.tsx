
import { useEffect, useRef, useState } from 'react';
import ReactGA from 'react-ga4';

interface TimeTrackingOptions {
  milestones?: number[]; // in seconds
  trackScrollDepth?: boolean;
  trackVisibility?: boolean;
  pageName: string;
}

interface ScrollDepthMilestone {
  percentage: number;
  label: string;
}

export const usePageTimeTracking = (options: TimeTrackingOptions) => {
  const {
    milestones = [10, 30, 60, 120], // Default milestones: 10s, 30s, 1min, 2min
    trackScrollDepth = true,
    trackVisibility = true,
    pageName
  } = options;

  const startTime = useRef<number>(Date.now());
  const visibilityStartTime = useRef<number>(Date.now());
  const totalVisibleTime = useRef<number>(0);
  const milestonesReached = useRef<Set<number>>(new Set());
  const scrollDepthsReached = useRef<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState<boolean>(!document.hidden);
  
  const scrollDepthMilestones: ScrollDepthMilestone[] = [
    { percentage: 25, label: '25%' },
    { percentage: 50, label: '50%' },
    { percentage: 75, label: '75%' },
    { percentage: 100, label: '100%' }
  ];

  // Track time milestones
  useEffect(() => {
    const checkMilestones = () => {
      const currentVisibleTime = getCurrentVisibleTime();
      
      milestones.forEach(milestone => {
        if (currentVisibleTime >= milestone * 1000 && !milestonesReached.current.has(milestone)) {
          milestonesReached.current.add(milestone);
          
          // Send GA4 event with react-ga4
          console.log(`📊 Sending engagement milestone: ${milestone}s on ${pageName}`);
          ReactGA.event('engagement_milestone', {
            page_name: pageName,
            milestone_seconds: milestone,
            total_time_seconds: Math.floor(currentVisibleTime / 1000)
          });
        }
      });
    };

    const interval = setInterval(checkMilestones, 1000); // Check every second
    return () => clearInterval(interval);
  }, [milestones, pageName]);

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      scrollDepthMilestones.forEach(({ percentage, label }) => {
        if (scrollPercentage >= percentage && !scrollDepthsReached.current.has(percentage)) {
          scrollDepthsReached.current.add(percentage);
          
          // Send GA4 event with react-ga4
          console.log(`📊 Sending scroll depth: ${label} on ${pageName}`);
          ReactGA.event('scroll_depth', {
            page_name: pageName,
            scroll_percentage: percentage,
            scroll_label: label
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth, pageName]);

  // Track visibility changes
  useEffect(() => {
    if (!trackVisibility) return;

    const handleVisibilityChange = () => {
      const isCurrentlyVisible = !document.hidden;
      
      if (isVisible && !isCurrentlyVisible) {
        // Page became hidden - add visible time
        totalVisibleTime.current += Date.now() - visibilityStartTime.current;
      } else if (!isVisible && isCurrentlyVisible) {
        // Page became visible - restart timer
        visibilityStartTime.current = Date.now();
      }
      
      setIsVisible(isCurrentlyVisible);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isVisible, trackVisibility]);

  // Track page exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      const totalTime = getCurrentVisibleTime();
      
      // Send final time tracking event with react-ga4
      console.log(`📊 Sending page exit time: ${Math.floor(totalTime / 1000)}s on ${pageName}`);
      ReactGA.event('page_exit_time', {
        page_name: pageName,
        total_time_seconds: Math.floor(totalTime / 1000),
        milestones_reached: Array.from(milestonesReached.current),
        scroll_depths_reached: Array.from(scrollDepthsReached.current)
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageName]);

  const getCurrentVisibleTime = (): number => {
    if (isVisible) {
      return totalVisibleTime.current + (Date.now() - visibilityStartTime.current);
    }
    return totalVisibleTime.current;
  };

  return {
    getCurrentVisibleTime: () => Math.floor(getCurrentVisibleTime() / 1000),
    milestonesReached: Array.from(milestonesReached.current),
    scrollDepthsReached: Array.from(scrollDepthsReached.current),
    isVisible
  };
};
