
import { ValidationTypes } from "@/types/form";
import { normalizePhoneNumber } from "./phoneUtils";

// Function for validating input based on type
export const validateInput = (value: string, type: ValidationTypes): boolean => {
  // Se il valore è "non lo so", è sempre considerato valido
  if (value === "non lo so") {
    return true;
  }
  
  switch (type) {
    case "euro":
      // Should be a positive number (integer)
      // Prima rimuovi tutti i separatori delle migliaia
      const cleanValue = value.replace(/\D/g, "");
      return /^[1-9][0-9]*$/.test(cleanValue) || cleanValue === "0";
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
    case "phone":
      // Italian mobile phone validation: 10 digits starting with 3
      const cleanPhone = value.replace(/\D/g, "");
      return /^3[0-9]{9}$/.test(cleanPhone);
    default:
      // By default, consider valid if not empty
      return value.trim().length > 0;
  }
};

// Function for validating Italian phone numbers
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  // Italian mobile numbers are exactly 10 digits
  return /^[0-9]{10}$/.test(cleanPhone);
};

// New function for validating international phone numbers with country code
export const validateInternationalPhoneNumber = (phone: string): boolean => {
  // Normalize the phone number (remove spaces, dashes, etc.)
  const normalizedPhone = normalizePhoneNumber(phone);
  
  // International format: + followed by 1-3 digit country code and 4-14 digits
  const phoneRegex = /^\+\d{1,3}\d{4,14}$/;
  
  return phoneRegex.test(normalizedPhone);
};
