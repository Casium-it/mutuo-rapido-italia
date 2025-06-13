
import ReactGA from 'react-ga4';

// Step 2: Analytics utility functions

/**
 * Initialize GA4 tracking
 */
export const initializeGA = () => {
  ReactGA.initialize('G-NCEGV2W1YP');
};

/**
 * Track page views
 */
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

/**
 * Track custom events
 */
export const trackEvent = (action: string, parameters: object = {}) => {
  ReactGA.event(action, parameters);
};

/**
 * Track simulation CTA button clicks
 */
export const trackSimulationCTAClick = (location: string) => {
  console.log(`🎯 Simulation CTA clicked: ${location}`);
  ReactGA.event('simulation_cta_click', {
    button_location: location,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track engagement milestones
 */
export const trackEngagementMilestone = (milestone: string) => {
  console.log(`📊 Engagement milestone reached: ${milestone}`);
  ReactGA.event('page_engagement_milestone', {
    milestone: milestone,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track scroll depth
 */
export const trackScrollDepth = (percentage: number) => {
  console.log(`📜 Scroll depth reached: ${percentage}%`);
  ReactGA.event('scroll_depth', {
    percentage: percentage,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track page exit
 */
export const trackPageExit = (totalTime: number) => {
  console.log(`🚪 Page exit: Total visible time ${totalTime}s`);
  ReactGA.event('page_exit', {
    total_time_seconds: totalTime,
    timestamp: new Date().toISOString()
  });
};
