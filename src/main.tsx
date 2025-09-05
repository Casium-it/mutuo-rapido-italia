
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupSlugHeader } from './integrations/supabase/setupSlugHeader';
import { initializeGA } from './utils/analytics';
import { PostHogProvider } from 'posthog-js/react';

// PostHog configuration
const POSTHOG_KEY = 'phc_RZBJUBpkzzkinjHUx98CZwT7Dg4qBorPpPVVAbKE7qQ';
const POSTHOG_HOST = 'https://eu.i.posthog.com';

const posthogOptions = {
  api_host: POSTHOG_HOST,
  // Enable session recordings
  capture_pageview: true,
  capture_pageleave: true,
  // Session replay settings
  session_recording: {
    maskAllInputs: false,
    maskInputOptions: {
      password: true,
    },
    recordCrossOriginIframes: false,
  },
  // Privacy settings
  respect_dnt: true,
  opt_out_capturing_by_default: false,
};

// Configura l'header x-slug per tutte le richieste Supabase
setupSlugHeader();

// Initialize Google Analytics 4
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  initializeGA(GA_MEASUREMENT_ID);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider apiKey={POSTHOG_KEY} options={posthogOptions}>
      <App />
    </PostHogProvider>
  </React.StrictMode>
);
