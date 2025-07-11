import { normalizePhoneNumber, isItalianPhoneNumber } from "./phoneUtils";

/**
 * Validates and formats a phone number specifically for Italian numbers
 * This uses the same validation logic as FormCompleted.tsx
 */
export function validateAndFormatItalianPhone(phone: string): {
  isValid: boolean;
  formattedPhone: string;
  error?: string;
} {
  if (!phone || phone.trim().length === 0) {
    return {
      isValid: false,
      formattedPhone: phone,
      error: "Il numero di telefono è obbligatorio"
    };
  }

  // Remove all spaces and formatting
  let cleanPhone = phone.replace(/\s+/g, "");
  
  // If it doesn't start with +39, add it
  if (!cleanPhone.startsWith("+39")) {
    // If it starts with 39, add the +
    if (cleanPhone.startsWith("39")) {
      cleanPhone = "+" + cleanPhone;
    } 
    // If it starts with 3 (typical Italian mobile), add +39
    else if (cleanPhone.startsWith("3")) {
      cleanPhone = "+39" + cleanPhone;
    }
    // Otherwise add +39
    else {
      cleanPhone = "+39" + cleanPhone;
    }
  }

  // Validate the formatted number
  if (!isItalianPhoneNumber(cleanPhone)) {
    return {
      isValid: false,
      formattedPhone: cleanPhone,
      error: "Inserisci un numero di telefono italiano valido (es. +39 123 456 7890)"
    };
  }

  return {
    isValid: true,
    formattedPhone: cleanPhone
  };
}

/**
 * Formats a phone number for display (adds spaces for readability)
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  
  // If it's an Italian number (+39), format it nicely
  if (normalized.startsWith('+39') && normalized.length === 13) {
    const number = normalized.slice(3); // Remove +39
    return `+39 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  }
  
  return normalized;
}
