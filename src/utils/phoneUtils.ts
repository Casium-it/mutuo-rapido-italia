/**
 * Utility functions for phone number handling
 */

/**
 * Normalizes a phone number by removing spaces, dashes, and other formatting
 * @param phoneNumber - The phone number to normalize
 * @returns Normalized phone number with only digits and + sign
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  // Remove all spaces, dashes, parentheses, and dots, but keep the +
  return phoneNumber.replace(/[\s\-\(\)\.]/g, '');
}

/**
 * Validates if a phone number has the correct format
 * @param phoneNumber - The phone number to validate (will be normalized first)
 * @returns True if valid, false otherwise
 */
export function validatePhoneNumberFormat(phoneNumber: string): boolean {
  // Clean the phone number first
  const cleanPhone = normalizePhoneNumber(phoneNumber);
  
  // International format: + followed by 1-3 digit country code and 4-14 digits
  const phoneRegex = /^\+\d{1,3}\d{4,14}$/;
  
  return phoneRegex.test(cleanPhone);
}

/**
 * Formats a phone number for display purposes
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number for display
 */
export function formatPhoneNumberForDisplay(phoneNumber: string): string {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // If it's an Italian number (+39), format it nicely
  if (normalized.startsWith('+39') && normalized.length === 13) {
    const number = normalized.slice(3); // Remove +39
    return `+39 ${number.slice(0, 3)} ${number.slice(3)}`;
  }
  
  // For other countries, just return the normalized version
  return normalized;
}

/**
 * Checks if a phone number is specifically Italian
 * @param phoneNumber - The phone number to check
 * @returns True if Italian format, false otherwise
 */
export function isItalianPhoneNumber(phoneNumber: string): boolean {
  const normalized = normalizePhoneNumber(phoneNumber);
  // Italian mobile numbers: +39 followed by 10 digits (total 13 characters)
  return /^\+39\d{10}$/.test(normalized);
}
