
/**
 * Funzioni di validazione per vari tipi di input
 */

// Lista dei mesi in italiano
const mesiItaliani = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
];

/**
 * Controlla se il valore è un numero intero positivo (formato euro)
 */
export const validateEuro = (value: string): boolean => {
  const numValue = Number(value);
  return !isNaN(numValue) && Number.isInteger(numValue) && numValue >= 0;
};

/**
 * Controlla se il valore è un mese valido in italiano
 */
export const validateMonth = (value: string): boolean => {
  const normalizedValue = value.trim().toLowerCase();
  return mesiItaliani.includes(normalizedValue);
};

/**
 * Controlla se il valore è un anno valido (1900-2150)
 */
export const validateYear = (value: string): boolean => {
  const numValue = Number(value);
  return !isNaN(numValue) && Number.isInteger(numValue) && numValue >= 1900 && numValue <= 2150;
};

/**
 * Controlla se il valore è un'età valida (16-100)
 */
export const validateAge = (value: string): boolean => {
  const numValue = Number(value);
  return !isNaN(numValue) && Number.isInteger(numValue) && numValue >= 16 && numValue <= 100;
};

/**
 * Controlla se il valore potrebbe essere una città valida
 * (almeno 2 caratteri, solo lettere, spazi e alcuni caratteri speciali)
 */
export const validateCity = (value: string): boolean => {
  if (value.trim().length < 2) return false;
  // Consente lettere, spazi, apostrofi e trattini (comuni nei nomi di città italiane)
  return /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆŠŽ\s'\-]+$/.test(value.trim());
};

/**
 * Controlla se il valore è un CAP italiano valido (5 cifre)
 */
export const validateCap = (value: string): boolean => {
  return /^\d{5}$/.test(value.trim());
};

/**
 * Validazione per testo libero (sempre valido)
 */
export const validateFreeText = (value: string): boolean => {
  return true;
};

/**
 * Funzione di validazione principale che verifica un valore in base al tipo di validazione
 */
export const validateInput = (value: string, validationType: string): boolean => {
  switch (validationType) {
    case "euro":
      return validateEuro(value);
    case "month":
      return validateMonth(value);
    case "year":
      return validateYear(value);
    case "age":
      return validateAge(value);
    case "city":
      return validateCity(value);
    case "cap":
      return validateCap(value);
    case "free_text":
      return validateFreeText(value);
    default:
      return false; // Se il tipo di validazione non è riconosciuto, consideriamo l'input non valido
  }
};
