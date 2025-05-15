
/**
 * Formatta un numero come valuta in Euro
 */
export function formatCurrency(value: string | number): string {
  if (value === undefined || value === null) return "0 €";
  
  // Converti in numero se è una stringa
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verifica che sia un numero valido
  if (isNaN(numValue)) return "0 €";
  
  // Formatta il numero
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
}
