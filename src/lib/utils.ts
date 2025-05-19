
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

// Formatta un numero con separatore migliaia in formato italiano
export function formatNumberWithThousandSeparator(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  return new Intl.NumberFormat('it-IT', { useGrouping: true }).format(numValue);
}

// Capitalizza la prima lettera di ogni parola
export function capitalizeWords(value: string): string {
  if (!value) return '';
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
