
// Questo file è un wrapper per compatibilità, reindirizza alla nuova implementazione
import { useFormExtended as useFormExtendedNew } from "@/domains/form/hooks/useFormExtended";

/**
 * Hook esteso per il form con funzionalità aggiuntive
 * Mantiene la compatibilità con l'implementazione precedente
 */
export const useFormExtended = () => {
  return useFormExtendedNew();
};

export default useFormExtended;
