
import { ValidationTypes } from "@/types/form";

// Function for validating input based on type
export const validateInput = (value: string, type: ValidationTypes): boolean => {
  // Se il valore è "non lo so", è sempre considerato valido
  if (value === "non lo so") {
    return true;
  }
  
  switch (type) {
    case "euro":
      // Should be a positive number (integer)
      return /^[1-9][0-9]*$/.test(value);
    case "month":
      // Italian month names validation
      const italianMonths = [
        "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
        "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
      ];
      return italianMonths.includes(value.toLowerCase());
    case "year":
      // Year validation (valid years between 1900 and 2150)
      const year = parseInt(value);
      return !isNaN(year) && year >= 1900 && year <= 2150;
    case "age":
      // Age validation (valid ages between 16 and 100)
      const age = parseInt(value);
      return !isNaN(age) && age >= 16 && age <= 100;
    case "city":
      // Basic city validation (at least 2 characters, only letters and spaces)
      return /^[a-zA-ZÀ-ÿ\s']{2,}$/.test(value);
    case "cap":
      // Italian postal code (CAP) validation - 5 digits
      return /^[0-9]{5}$/.test(value);
    case "free_text":
      // For free text, simply check if it's not empty
      return value.trim().length > 0;
    default:
      // By default, consider valid if not empty
      return value.trim().length > 0;
  }
};
