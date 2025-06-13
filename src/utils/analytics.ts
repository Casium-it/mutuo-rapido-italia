import ReactGA from 'react-ga4';

// Initialize GA4 with react-ga4
export const initializeGA = () => {
  ReactGA.initialize('G-NCEGV2W1YP');
  
  console.log('📊 GA4 initialized with tracking ID: G-NCEGV2W1YP');
  
  // Send initial pageview
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

// Centralized analytics utility for GA4 event tracking
export const analytics = {
  // Track contact view events (WhatsApp button clicks, etc.)
  trackContactView: (contactType: string, location: string) => {
    console.log(`📊 Sending contact view: ${contactType} from ${location}`);
    ReactGA.event('contact_view', {
      contact_type: contactType,
      location: location,
      page_path: window.location.pathname
    });
  },

  // Track custom events with flexible parameters
  trackEvent: (eventName: string, parameters: Record<string, any> = {}) => {
    console.log(`📊 Sending custom event: ${eventName}`, parameters);
    ReactGA.event(eventName, {
      ...parameters,
      page_path: window.location.pathname
    });
  }
};
