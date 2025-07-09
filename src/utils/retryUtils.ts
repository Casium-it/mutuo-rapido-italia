
/**
 * Utility for implementing retry logic with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffFactor?: number;
  onRetry?: (attempt: number, error: any) => void;
  onProgress?: (attempt: number, maxAttempts: number, error: any) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
  totalTime: number;
}

/**
 * Determines if an error is retryable based on error type and message
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;

  // Network errors
  if (error.message?.includes('NetworkError') || 
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('fetch')) {
    return true;
  }

  // Supabase connection errors
  if (error.code === 'PGRST301' || // Connection timeout
      error.code === 'PGRST116' || // Not found (can be temporary)
      error.message?.includes('connection') ||
      error.message?.includes('timeout') ||
      error.message?.includes('pool')) {
    return true;
  }

  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  // Rate limiting
  if (error.status === 429) {
    return true;
  }

  return false;
}

/**
 * Determines if an error is permanent and should not be retried
 */
export function isPermanentError(error: any): boolean {
  // Expired submission errors
  if (error.message?.includes('scaduta') || 
      error.message?.includes('expired') ||
      error.message?.includes('expires_at')) {
    return true;
  }

  // Validation errors
  if (error.status === 400 || error.status === 422) {
    return true;
  }

  // Authentication errors
  if (error.status === 401 || error.status === 403) {
    return true;
  }

  return false;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay for exponential backoff
 */
export function calculateDelay(attempt: number, options: RetryOptions): number {
  const baseDelay = options.baseDelay || 1000;
  const backoffFactor = options.backoffFactor || 2;
  const maxDelay = options.maxDelay || 8000;
  
  const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  
  return Math.floor(delay + jitter);
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    onRetry,
    onProgress
  } = options;

  const startTime = Date.now();
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[Retry] Attempt ${attempt}/${maxAttempts}`);
      
      const result = await operation();
      
      const totalTime = Date.now() - startTime;
      console.log(`[Retry] Success on attempt ${attempt}/${maxAttempts} after ${totalTime}ms`);
      
      return {
        success: true,
        data: result,
        attempts: attempt,
        totalTime
      };
      
    } catch (error) {
      lastError = error;
      
      console.log(`[Retry] Attempt ${attempt}/${maxAttempts} failed:`, error);
      
      // Check if error is permanent - don't retry
      if (isPermanentError(error)) {
        console.log(`[Retry] Permanent error detected, stopping retries:`, error);
        break;
      }
      
      // Check if error is retryable
      if (!isRetryableError(error)) {
        console.log(`[Retry] Non-retryable error detected, stopping retries:`, error);
        break;
      }
      
      // If this is the last attempt, don't delay
      if (attempt === maxAttempts) {
        console.log(`[Retry] Max attempts reached (${maxAttempts})`);
        break;
      }
      
      // Call progress callback
      if (onProgress) {
        onProgress(attempt, maxAttempts, error);
      }
      
      // Calculate and apply delay
      const delay = calculateDelay(attempt, options);
      console.log(`[Retry] Waiting ${delay}ms before attempt ${attempt + 1}`);
      
      // Call retry callback
      if (onRetry) {
        onRetry(attempt, error);
      }
      
      await sleep(delay);
    }
  }
  
  const totalTime = Date.now() - startTime;
  console.log(`[Retry] All attempts failed after ${totalTime}ms`);
  
  return {
    success: false,
    error: lastError,
    attempts: maxAttempts,
    totalTime
  };
}
