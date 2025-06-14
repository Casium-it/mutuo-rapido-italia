
import ReactGA from 'react-ga4';

// Initialize GA4
export const initializeGA = (measurementId: string) => {
  ReactGA.initialize(measurementId);
};

// Track pageviews
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

// Track custom events
export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
  ReactGA.event({
    action,
    category,
    label,
    value,
  });
};
