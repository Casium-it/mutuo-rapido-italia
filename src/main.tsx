
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupSlugHeader } from './integrations/supabase/setupSlugHeader';
import { initializeGA } from './utils/analytics';

// Configura l'header x-slug per tutte le richieste Supabase
setupSlugHeader();

// Initialize Google Analytics
initializeGA();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
