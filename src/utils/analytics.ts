
import ReactGA from 'react-ga4';

// Debug mode - can be enabled via environment variable
const DEBUG_MODE = import.meta.env.VITE_ANALYTICS_DEBUG === 'true' || false;

// Initialize GA4
export const initializeGA = (measurementId: string) => {
  ReactGA.initialize(measurementId);
  if (DEBUG_MODE) {
    console.log('🔍 Analytics initialized with ID:', measurementId);
  }
};

// Enhanced logging function
const logEvent = (action: string, category?: string, label?: string, value?: number) => {
  if (DEBUG_MODE) {
    const timestamp = new Date().toISOString();
    console.log(`📊 [${timestamp}] Analytics Event:`, {
      action,
      category,
      label,
      value
    });
  }
};

// Track pageviews
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
  if (DEBUG_MODE) {
    console.log(`📄 Page view tracked: ${path}`);
  }
};

// Track custom events with enhanced logging
export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
  logEvent(action, category, label, value);
  
  ReactGA.event({
    action,
    category,
    label,
    value,
  });
};

// Track time spent milestones
export const trackTimeMilestone = (page: string, milestone: number) => {
  const action = 'time_milestone';
  const category = 'engagement';
  const label = `${page}_${milestone}s`;
  
  logEvent(action, category, label, milestone);
  console.log(`⏱️ Time milestone reached: ${milestone}s on ${page}`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: milestone,
  });
};

// Track page exits
export const trackPageExit = (page: string, exitType: string, timeSpent: number) => {
  const action = 'page_exit';
  const category = 'navigation';
  const label = `${page}_${exitType}`;
  
  logEvent(action, category, label, timeSpent);
  console.log(`🚪 Page exit tracked: ${exitType} from ${page} after ${timeSpent}s`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: timeSpent,
  });
};

// Enhanced tracking for specific events with logging
export const trackWhatsAppContact = (source: string) => {
  console.log(`📱 WhatsApp contact initiated from: ${source}`);
  trackEvent('whatsapp_contact', 'contact', source);
};

export const trackSimulationCTA = (position: string) => {
  console.log(`🎯 Simulation CTA clicked at: ${position}`);
  trackEvent('simulazione_cta_click', 'cta', `home_page_${position}`);
};
