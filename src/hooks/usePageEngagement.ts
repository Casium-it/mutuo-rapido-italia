
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

  // Engagement milestones in seconds
  const MILESTONES = [10, 30, 60, 120, 300]; // 10s, 30s, 1min, 2min, 5min
  const SCROLL_DEPTHS = [25, 50, 75, 100]; // percentage thresholds

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
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
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
    trackPageExit(totalTime);
  };

  useEffect(() => {
    console.log('🚀 Page engagement tracking started');
    
    // Set up milestone checking interval
    intervalRef.current = setInterval(checkMilestones, 1000);

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', handleScroll);
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
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handlePageExit);
      window.removeEventListener('unload', handlePageExit);
    };
  }, [isVisible]);

  return {
    isVisible,
    totalVisibleTime: totalVisibleTimeRef.current,
    milestonesTracked: Array.from(milestonesTracked),
    scrollDepthsTracked: Array.from(scrollDepthsTracked)
  };
};
