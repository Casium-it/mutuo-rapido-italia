
// Centralized analytics utility for GA4 event tracking
export const analytics = {
  // Track contact view events (WhatsApp button clicks, etc.)
  trackContactView: (contactType: string, location: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      console.log(`📊 Sending contact view: ${contactType} from ${location}`);
      window.gtag('event', 'contact_view', {
        contact_type: contactType,
        location: location,
        page_path: window.location.pathname
      });
    }
  },

  // Track custom events with flexible parameters
  trackEvent: (eventName: string, parameters: Record<string, any> = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      console.log(`📊 Sending custom event: ${eventName}`, parameters);
      window.gtag('event', eventName, {
        ...parameters,
        page_path: window.location.pathname
      });
    }
  }
};
