
import { ValidationTypes } from "@/types/form";

export function validateInput(value: string, validation?: ValidationTypes): boolean {
  // Se non è specificato un tipo di validazione, consideriamo l'input valido
  if (!validation) {
    return true;
  }

  // Se il valore è vuoto, consideriamo l'input non valido indipendentemente dal tipo di validazione
  if (!value || value.trim() === "") {
    return false;
  }

  switch (validation) {
    case "free_text":
      return true; // Nessuna validazione per il testo libero

    case "euro":
      // Deve essere un numero intero positivo
      return /^[1-9]\d*$/.test(value);

    case "month":
      // Mesi in italiano, case insensitive
      const months = [
        "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", 
        "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
      ];
      return months.includes(value.toLowerCase());

    case "year":
      // Anno tra 1900 e 2150
      const year = parseInt(value);
      return !isNaN(year) && year >= 1900 && year <= 2150;

    case "age":
      // Età tra 16 e 100
      const age = parseInt(value);
      return !isNaN(age) && age >= 16 && age <= 100;

    case "city":
      // Semplice validazione per il nome di una città: almeno 2 caratteri, solo lettere e spazi
      return /^[A-Za-zÀ-ÿ\s']{2,}$/.test(value);

    case "cap":
      // CAP italiano: 5 cifre
      return /^\d{5}$/.test(value);

    default:
      return true;
  }
}
