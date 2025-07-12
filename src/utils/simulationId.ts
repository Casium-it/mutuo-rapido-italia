/**
 * Simulation ID utilities for unique simulation tracking
 */

/**
 * Generates a unique simulation ID
 * Format: SIM-{timestamp}-{random}
 * Example: SIM-1704067200000-A1B2C3D4
 */
export function generateSimulationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `SIM-${timestamp}-${random}`;
}

/**
 * Validates if a string is a valid simulation ID
 */
export function isValidSimulationId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  
  // Check format: SIM-{timestamp}-{random}
  const pattern = /^SIM-\d{13}-[A-Z0-9]{8}$/;
  return pattern.test(id);
}

/**
 * Extracts timestamp from a simulation ID
 */
export function getTimestampFromSimulationId(id: string): number | null {
  if (!isValidSimulationId(id)) return null;
  
  const parts = id.split('-');
  if (parts.length !== 3) return null;
  
  const timestamp = parseInt(parts[1], 10);
  return isNaN(timestamp) ? null : timestamp;
}

/**
 * Checks if a simulation ID was created before a certain date
 */
export function isSimulationIdOlderThan(id: string, days: number): boolean {
  const timestamp = getTimestampFromSimulationId(id);
  if (!timestamp) return false;
  
  const dayInMs = 24 * 60 * 60 * 1000;
  const cutoffTime = Date.now() - (days * dayInMs);
  
  return timestamp < cutoffTime;
}