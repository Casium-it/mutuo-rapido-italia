
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
  
  // Initialize simulation timer
  sessionStorage.setItem('simulation_start_time', Date.now().toString());
  
  trackEvent('simulation_start', 'simulation', option);
};

// New form interaction tracking functions
export const trackSimulationReply = (blockId: string, questionId: string, replyTimeSeconds: number, responseValue?: string) => {
  const action = 'simulation_reply';
  const category = 'form_interaction';
  const label = `${blockId}_${questionId}`;
  
  logEvent(action, category, label, replyTimeSeconds);
  console.log(`📝 Form reply tracked: ${blockId}/${questionId} - ${replyTimeSeconds}s${responseValue ? ` - "${responseValue}"` : ''}`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: replyTimeSeconds
  });
};

export const trackBackNavigation = (fromBlockId: string, fromQuestionId: string, toBlockId: string, toQuestionId: string) => {
  const action = 'simulation_back_navigation';
  const category = 'form_navigation';
  const label = `${fromBlockId}_${fromQuestionId}_to_${toBlockId}_${toQuestionId}`;
  
  logEvent(action, category, label);
  console.log(`⬅️ Back navigation tracked: ${fromBlockId}/${fromQuestionId} → ${toBlockId}/${toQuestionId}`);
  
  ReactGA.event({
    action,
    category,
    label
  });
};

export const trackChangeResponse = (blockId: string, questionId: string, placeholderKey: string, previousValue?: string) => {
  const action = 'simulation_change_response';
  const category = 'form_interaction';
  const label = `${blockId}_${questionId}_${placeholderKey}`;
  
  logEvent(action, category, label);
  console.log(`✏️ Response change tracked: ${blockId}/${questionId}/${placeholderKey}${previousValue ? ` - was "${previousValue}"` : ''}`);
  
  ReactGA.event({
    action,
    category,
    label
  });
};

// Helper function to get total simulation time
const getTotalSimulationTime = (): number => {
  const startTime = sessionStorage.getItem('simulation_start_time');
  if (!startTime) return 0;
  return Math.floor((Date.now() - parseInt(startTime)) / 1000);
};

// New simulation flow tracking functions
export const trackSimulationExit = (exitType: 'confirmed_exit_without_save' | 'tab_close') => {
  const totalTimeSeconds = getTotalSimulationTime();
  const action = 'simulation_exit';
  const category = 'simulation_flow';
  const label = exitType;
  
  logEvent(action, category, label, totalTimeSeconds);
  console.log(`🚪 Simulation exit tracked: ${exitType} after ${totalTimeSeconds}s`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: totalTimeSeconds
  });
  
  // Clear simulation timer
  sessionStorage.removeItem('simulation_start_time');
};

export const trackSimulationSave = () => {
  const totalTimeSeconds = getTotalSimulationTime();
  const action = 'simulation_save';
  const category = 'simulation_flow';
  const label = 'save_successful';
  
  logEvent(action, category, label, totalTimeSeconds);
  console.log(`💾 Simulation save tracked after ${totalTimeSeconds}s`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: totalTimeSeconds
  });
};

export const trackSimulationCompleted = () => {
  const totalTimeSeconds = getTotalSimulationTime();
  const action = 'simulation_completed';
  const category = 'simulation_flow';
  const label = 'form_submitted';
  
  logEvent(action, category, label, totalTimeSeconds);
  console.log(`✅ Simulation completed tracked after ${totalTimeSeconds}s`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: totalTimeSeconds
  });
  
  // Clear simulation timer
  sessionStorage.removeItem('simulation_start_time');
};

export const trackSimulationContactDetails = (pageTimeSeconds: number, hasConsulting: boolean) => {
  const action = 'simulation_contact_details';
  const category = 'contact_conversion';
  const label = hasConsulting ? 'with_consulting' : 'no_consulting';
  
  logEvent(action, category, label, pageTimeSeconds);
  console.log(`📞 Contact details submitted: ${label} after ${pageTimeSeconds}s on page`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: pageTimeSeconds
  });
};

export const trackSimulationLostDetails = (pageTimeSeconds: number) => {
  const action = 'simulation_lost_details';
  const category = 'contact_conversion';
  const label = 'abandoned_contact_form';
  
  logEvent(action, category, label, pageTimeSeconds);
  console.log(`❌ Contact details abandoned after ${pageTimeSeconds}s on page`);
  
  ReactGA.event({
    action,
    category,
    label,
    value: pageTimeSeconds
  });
};
