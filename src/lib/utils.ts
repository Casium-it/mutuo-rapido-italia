
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Aggiungiamo una funzione di utility per calcolare il progresso percentuale
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

// Formatta un numero come valuta in Euro
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Misura la larghezza di un testo usando l'API Canvas
export function measureTextWidth(text: string, font: string): number {
  if (!text) return 0;
  
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  
  return 0;
}
