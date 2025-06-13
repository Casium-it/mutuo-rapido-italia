
import ReactGA from 'react-ga4';

// Initialize GA4 - you'll need to set your GA4 measurement ID
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

export const initializeGA = () => {
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log('GA4 initialized with ID:', GA_MEASUREMENT_ID);
  } else {
    console.log('GA4 not initialized - missing measurement ID');
  }
};

export const trackPageView = (path: string) => {
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.send({ hitType: 'pageview', page: path });
    console.log('Page view tracked:', path);
  }
};

export const trackEvent = (action: string, parameters: object = {}) => {
  if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
    ReactGA.event(action, parameters);
    console.log('Event tracked:', action, parameters);
  } else {
    console.log('Event would be tracked:', action, parameters);
  }
};

// Specific tracking functions for common events
export const trackSimulationStart = (source: string = 'unknown') => {
  trackEvent('simulation_started', {
    source,
    timestamp: new Date().toISOString()
  });
};

export const trackContactAttempt = (method: 'whatsapp' | 'form' | 'other' = 'other') => {
  trackEvent('contact_attempt', {
    method,
    timestamp: new Date().toISOString()
  });
};

export const trackCTAClick = (cta_text: string, location: string) => {
  trackEvent('cta_click', {
    cta_text,
    location,
    timestamp: new Date().toISOString()
  });
};
