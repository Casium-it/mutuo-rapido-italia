
import ReactGA from 'react-ga4';

// Initialize GA4 with react-ga4
export const initializeGA = () => {
  ReactGA.initialize('G-NCEGV2W1YP', { debug_mode: true });
  
  console.log('📊 GA4 initialized with tracking ID: G-NCEGV2W1YP');
  
  // Send initial pageview with correct GA4 syntax
  ReactGA.send("page_view", { 
    page_path: window.location.pathname,
    page_title: document.title 
  });
  
  // Test event
  ReactGA.event('test_event', {
    label: 'check_if_works',
    value: 123,
  });
  
  console.log('📊 Test event sent: test_event with label check_if_works');
};

// Centralized analytics utility for GA4 event tracking
export const analytics = {
  // Track contact view events (WhatsApp button clicks, etc.)
  trackContactView: (contactType: string, location: string) => {
    try {
      console.log(`📊 Triggering contact view event: ${contactType} from ${location}`);
      ReactGA.event('contact_view', {
        contact_type: contactType,
        location: location,
        page_path: window.location.pathname
      });
      console.log(`📊 Contact view event sent successfully`);
    } catch (error) {
      console.error('📊 Error sending contact view event:', error);
    }
  },

  // Track custom events with flexible parameters
  trackEvent: (eventName: string, parameters: Record<string, any> = {}) => {
    try {
      console.log(`📊 Triggering custom event: ${eventName}`, parameters);
      ReactGA.event(eventName, {
        ...parameters,
        page_path: window.location.pathname
      });
      console.log(`📊 Custom event sent successfully: ${eventName}`);
    } catch (error) {
      console.error(`📊 Error sending custom event ${eventName}:`, error);
    }
  }
};
