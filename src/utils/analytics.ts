
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

export const trackSimulationStart = (option: string, source: string = 'simulazione_avanzata') => {
  console.log(`🚀 Simulation started with option: ${option} from ${source}`);
  trackEvent('simulation_start', 'simulation', option);
};

// New tracking function for simulation replies
export const trackSimulationReply = (blockId: string, questionId: string, replyTimeSeconds: number) => {
  const action = 'simulation_reply';
  const category = 'form_interaction';
  const label = `${blockId}_${questionId}`;
  
  logEvent(action, category, label, replyTimeSeconds);
  console.log(`💬 Simulation reply tracked: ${blockId}/${questionId} after ${replyTimeSeconds}s`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: replyTimeSeconds,
  });
};

// New tracking function for back navigation
export const trackSimulationBackNavigation = (blockId: string, questionId: string) => {
  const action = 'simulation_back_navigation';
  const category = 'navigation';
  const label = `${blockId}_${questionId}`;
  
  logEvent(action, category, label);
  console.log(`⬅️ Back navigation tracked: ${blockId}/${questionId}`);
  
  ReactGA.event({
    action,
    category,
    label,
  });
};

// New tracking function for response changes
export const trackSimulationChangeResponse = (blockId: string, questionId: string) => {
  const action = 'simulation_change_response';
  const category = 'form_interaction';
  const label = `${blockId}_${questionId}`;
  
  logEvent(action, category, label);
  console.log(`✏️ Response change tracked: ${blockId}/${questionId}`);
  
  ReactGA.event({
    action,
    category,
    label,
  });
};

// New tracking function for simulation exit
export const trackSimulationExit = (exitType: 'confirmed_exit' | 'tab_close', totalTimeSeconds: number) => {
  const action = 'simulation_exit';
  const category = 'simulation';
  const label = exitType;
  
  logEvent(action, category, label, totalTimeSeconds);
  console.log(`🚪 Simulation exit tracked: ${exitType} after ${totalTimeSeconds}s total`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: totalTimeSeconds,
  });
};

// New tracking function for simulation save
export const trackSimulationSave = (totalTimeSeconds: number) => {
  const action = 'simulation_save';
  const category = 'simulation';
  const label = 'saved_successfully';
  
  logEvent(action, category, label, totalTimeSeconds);
  console.log(`💾 Simulation save tracked after ${totalTimeSeconds}s total`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: totalTimeSeconds,
  });
};

// New tracking function for simulation completion
export const trackSimulationCompleted = (totalTimeSeconds: number) => {
  const action = 'simulation_completed';
  const category = 'simulation';
  const label = 'completed_successfully';
  
  logEvent(action, category, label, totalTimeSeconds);
  console.log(`🎉 Simulation completed tracked after ${totalTimeSeconds}s total`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: totalTimeSeconds,
  });
};

// New tracking function for contact details submission
export const trackSimulationContactDetails = (timeToSubmitSeconds: number, hasConsulting: boolean) => {
  const action = 'simulation_contact_details';
  const category = 'form_completion';
  const label = hasConsulting ? 'with_consulting' : 'no_consulting';
  
  logEvent(action, category, label, timeToSubmitSeconds);
  console.log(`📋 Contact details tracked: ${label} after ${timeToSubmitSeconds}s on page`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: timeToSubmitSeconds,
  });
};

// New tracking function for lost contact details
export const trackSimulationLostDetails = (exitType: 'navigate' | 'tab_close' | 'page_close', timeOnPageSeconds: number) => {
  const action = 'simulation_lost_details';
  const category = 'form_abandonment';
  const label = exitType;
  
  logEvent(action, category, label, timeOnPageSeconds);
  console.log(`💔 Contact details lost: ${exitType} after ${timeOnPageSeconds}s on page`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: timeOnPageSeconds,
  });
};
