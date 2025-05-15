
import { RepeatingGroupEntry } from "@/types/form";

// Custom event name for resetting repeating groups
const RESET_EVENT_NAME = "repeating_group_reset";

// Format a value as currency
export const formatCurrency = (value: any): string => {
  if (value === undefined || value === null) {
    return "0,00 €";
  }
  
  // Parse to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number
  if (isNaN(numValue)) {
    return "0,00 €";
  }
  
  // Format with Italian locale
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

// Get a human-readable label for an income type
export const getIncomeTypeLabel = (incomeType: string): string => {
  const labels: Record<string, string> = {
    "rental": "Reddito da affitto",
    "freelance": "Lavoro autonomo",
    "child_support": "Mantenimento figli",
    "allowance": "Indennità",
    "dividends": "Dividendi",
    "pension": "Pensione",
    "other": "Altro"
  };
  
  return labels[incomeType] || incomeType || "Reddito aggiuntivo";
};

// Dispatch a custom event to notify listeners that repeating group data has been reset
export const dispatchResetEvent = (): void => {
  const event = new CustomEvent(RESET_EVENT_NAME);
  window.dispatchEvent(event);
  console.log("Dispatched reset event for repeating groups");
};

// Add a listener for the reset event
export const addResetListener = (callback: () => void): (() => void) => {
  const handler = () => {
    console.log("Reset event received");
    callback();
  };
  
  window.addEventListener(RESET_EVENT_NAME, handler);
  
  // Return a function to remove the listener
  return () => {
    window.removeEventListener(RESET_EVENT_NAME, handler);
  };
};

// Check if there is repeating group data in localStorage
export const hasRepeatingGroupData = (blockType: string): boolean => {
  const storageKey = `form-state-${blockType}`;
  const storedData = localStorage.getItem(storageKey);
  
  if (!storedData) {
    return false;
  }
  
  try {
    const parsedData = JSON.parse(storedData);
    return parsedData.repeatingGroups && Object.keys(parsedData.repeatingGroups).length > 0;
  } catch (e) {
    console.error("Error checking for repeating group data:", e);
    return false;
  }
};

// Get all repeating groups from localStorage
export const getAllRepeatingGroups = (blockType: string): Record<string, RepeatingGroupEntry[]> => {
  const storageKey = `form-state-${blockType}`;
  const storedData = localStorage.getItem(storageKey);
  
  if (!storedData) {
    return {};
  }
  
  try {
    const parsedData = JSON.parse(storedData);
    return parsedData.repeatingGroups || {};
  } catch (e) {
    console.error("Error getting repeating groups:", e);
    return {};
  }
};

// Save all repeating groups to localStorage
export const saveRepeatingGroupEntries = (
  blockType: string, 
  repeatingGroups: Record<string, RepeatingGroupEntry[]>
): boolean => {
  const storageKey = `form-state-${blockType}`;
  const storedData = localStorage.getItem(storageKey);
  
  if (!storedData) {
    return false;
  }
  
  try {
    const parsedData = JSON.parse(storedData);
    parsedData.repeatingGroups = repeatingGroups;
    localStorage.setItem(storageKey, JSON.stringify(parsedData));
    return true;
  } catch (e) {
    console.error("Error saving repeating groups:", e);
    return false;
  }
};

// Reset all repeating groups in localStorage
export const resetAllRepeatingGroups = (blockType: string): boolean => {
  const storageKey = `form-state-${blockType}`;
  const storedData = localStorage.getItem(storageKey);
  
  if (!storedData) {
    return false;
  }
  
  try {
    const parsedData = JSON.parse(storedData);
    parsedData.repeatingGroups = {};
    localStorage.setItem(storageKey, JSON.stringify(parsedData));
    return true;
  } catch (e) {
    console.error("Error resetting repeating groups:", e);
    return false;
  }
};
