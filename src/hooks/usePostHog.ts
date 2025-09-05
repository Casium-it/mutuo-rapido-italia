import { usePostHog } from 'posthog-js/react';

/**
 * Custom hook to interact with PostHog analytics
 * Provides convenient methods for tracking events, identifying users, and managing session recordings
 */
export const useAnalytics = () => {
  const posthog = usePostHog();

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (posthog) {
      posthog.capture(eventName, properties);
    }
  };

  const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
    if (posthog) {
      posthog.identify(userId, userProperties);
    }
  };

  const setUserProperties = (properties: Record<string, any>) => {
    if (posthog) {
      posthog.setPersonProperties(properties);
    }
  };

  const startSessionRecording = () => {
    if (posthog) {
      posthog.startSessionRecording();
    }
  };

  const stopSessionRecording = () => {
    if (posthog) {
      posthog.stopSessionRecording();
    }
  };

  const resetUser = () => {
    if (posthog) {
      posthog.reset();
    }
  };

  // Common events for GoMutuo
  const trackPageView = (page: string) => {
    trackEvent('$pageview', { page });
  };

  const trackFormStart = (formType: string) => {
    trackEvent('form_started', { form_type: formType });
  };

  const trackFormCompleted = (formType: string, completionTime?: number) => {
    trackEvent('form_completed', { 
      form_type: formType,
      completion_time: completionTime 
    });
  };

  const trackSimulationSaved = (method: 'auto' | 'manual', percentage: number) => {
    trackEvent('simulation_saved', { 
      save_method: method,
      completion_percentage: percentage 
    });
  };

  const trackLeadGenerated = (source: string) => {
    trackEvent('lead_generated', { source });
  };

  const trackUserAction = (action: string, context?: Record<string, any>) => {
    trackEvent('user_action', { action, ...context });
  };

  return {
    // Core PostHog methods
    trackEvent,
    identifyUser,
    setUserProperties,
    startSessionRecording,
    stopSessionRecording,
    resetUser,
    
    // Common tracking methods
    trackPageView,
    trackFormStart,
    trackFormCompleted,
    trackSimulationSaved,
    trackLeadGenerated,
    trackUserAction,
    
    // Direct access to PostHog instance
    posthog,
  };
};