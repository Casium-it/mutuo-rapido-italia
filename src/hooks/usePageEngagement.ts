
import { useEffect, useRef, useState } from 'react';
import { trackEngagementMilestone, trackScrollDepth, trackPageExit } from '@/utils/analytics';

export const usePageEngagement = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [scrollDepthsTracked, setScrollDepthsTracked] = useState<Set<number>>(new Set());
  const [milestonesTracked, setMilestonesTracked] = useState<Set<number>>(new Set());
  
  const startTimeRef = useRef<number>(Date.now());
  const totalVisibleTimeRef = useRef<number>(0);
  const lastVisibilityChangeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Engagement milestones in seconds
  const MILESTONES = [10, 30, 60, 120, 300]; // 10s, 30s, 1min, 2min, 5min
  const SCROLL_DEPTHS = [25, 50, 75, 100]; // percentage thresholds
  const SCROLL_THROTTLE_MS = 100; // Throttle scroll events to every 100ms

  const updateVisibleTime = () => {
    if (isVisible) {
      const now = Date.now();
      totalVisibleTimeRef.current += (now - lastVisibilityChangeRef.current) / 1000;
      lastVisibilityChangeRef.current = now;
    }
  };

  const checkMilestones = () => {
    if (!isVisible) return;

    updateVisibleTime();
    const currentVisibleTime = totalVisibleTimeRef.current;

    MILESTONES.forEach(milestone => {
      if (currentVisibleTime >= milestone && !milestonesTracked.has(milestone)) {
        setMilestonesTracked(prev => new Set([...prev, milestone]));
        
        let milestoneLabel = '';
        if (milestone < 60) {
          milestoneLabel = `${milestone}s`;
        } else {
          milestoneLabel = `${milestone / 60}min`;
        }
        
        trackEngagementMilestone(milestoneLabel);
      }
    });
  };

  const handleScroll = () => {
    const now = Date.now();
    
    // Throttle scroll events to prevent spam
    if (now - lastScrollTimeRef.current < SCROLL_THROTTLE_MS) {
      return;
    }
    
    lastScrollTimeRef.current = now;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (docHeight <= 0) return; // Prevent division by zero
    
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    SCROLL_DEPTHS.forEach(depth => {
      if (scrollPercent >= depth && !scrollDepthsTracked.has(depth)) {
        setScrollDepthsTracked(prev => new Set([...prev, depth]));
        trackScrollDepth(depth);
      }
    });
  };

  const handleVisibilityChange = () => {
    const wasVisible = isVisible;
    const nowVisible = !document.hidden;
    
    console.log(`👁️ Page visibility changed: ${wasVisible ? 'visible' : 'hidden'} → ${nowVisible ? 'visible' : 'hidden'}`);
    
    if (wasVisible && !nowVisible) {
      // Page becoming hidden - update total visible time
      updateVisibleTime();
    } else if (!wasVisible && nowVisible) {
      // Page becoming visible - reset timer
      lastVisibilityChangeRef.current = Date.now();
    }
    
    setIsVisible(nowVisible);
  };

  const handlePageExit = () => {
    updateVisibleTime();
    const totalTime = Math.round(totalVisibleTimeRef.current);
    console.log(`🚪 Final page exit tracking: ${totalTime}s`);
    trackPageExit(totalTime);
  };

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      console.log('⚠️ usePageEngagement already initialized, skipping');
      return;
    }
    
    console.log('🚀 Page engagement tracking started');
    isInitializedRef.current = true;
    
    // Set up milestone checking interval (only once)
    intervalRef.current = setInterval(checkMilestones, 1000);

    // Add event listeners (only once)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handlePageExit);
    window.addEventListener('unload', handlePageExit);

    // Initial scroll check
    handleScroll();

    return () => {
      console.log('🛑 Page engagement tracking stopped');
      
      // Final time update and exit tracking
      handlePageExit();
      
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('unload', handlePageExit);
      
      isInitializedRef.current = false;
      console.log('✅ Cleanup completed');
    };
  }, []); // Empty dependency array - run only once on mount

  return {
    isVisible,
    totalVisibleTime: totalVisibleTimeRef.current,
    milestonesTracked: Array.from(milestonesTracked),
    scrollDepthsTracked: Array.from(scrollDepthsTracked)
  };
};
