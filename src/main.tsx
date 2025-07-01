
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupSlugHeader } from './integrations/supabase/setupSlugHeader';
import { initializeGA } from './utils/analytics';
import { preloadService } from './services/preloadService';

// Configura l'header x-slug per tutte le richieste Supabase
setupSlugHeader();

// Initialize Google Analytics 4
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  initializeGA(GA_MEASUREMENT_ID);
}

// Initialize form preloading in background
preloadService.initialize().catch(error => {
  console.warn('Failed to initialize form preloading:', error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
