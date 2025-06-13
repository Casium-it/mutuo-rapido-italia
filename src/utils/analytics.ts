
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
