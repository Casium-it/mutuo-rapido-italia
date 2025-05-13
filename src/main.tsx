
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { allBlocks } from './data/blocks'

// Esporre i blocchi alla finestra per la compatibilità con il codice esistente
declare global {
  interface Window {
    formBlocks?: any[];
  }
}

window.formBlocks = allBlocks;

createRoot(document.getElementById("root")!).render(<App />);
