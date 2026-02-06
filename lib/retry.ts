import { logger } from './logger';

interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('enotfound') || message.includes('econnrefused') || message.includes('etimedout')) {
      return true;
    }

    // Database connection errors
    if (message.includes('connection') || message.includes('timeout')) {
      return true;
    }
  }

  // Check if it's a fetch error
  if (error instanceof TypeError) {
    const message = error.message.toLowerCase();
    if (message.includes('fetch') || message.includes('network')) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, options.maxDelayMs);
  const jitter = cappedDelay * 0.1 * Math.random(); // 10% jitter
  return Math.floor(cappedDelay + jitter);
}

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= mergedOptions.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === mergedOptions.maxAttempts) {
        break;
      }

      const delay = calculateDelay(attempt, mergedOptions);
      logger.debug(`Retry attempt ${attempt}/${mergedOptions.maxAttempts} after ${delay}ms`, {
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Retry an async function that returns a result (no exception on failure)
 * Useful for API calls that return error responses
 */
export async function retryWithResult<T, E>(
  fn: () => Promise<{ data: T | null; error: E | null }>,
  isRetryableResult: (error: E | null) => boolean = () => false,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: E | null }> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  let lastResult: { data: T | null; error: E | null } = { data: null, error: null };

  for (let attempt = 1; attempt <= mergedOptions.maxAttempts; attempt++) {
    try {
      const result = await fn();
      lastResult = result;

      // Return if successful or error is not retryable
      if (!result.error || !isRetryableResult(result.error)) {
        return result;
      }

      // Don't retry on last attempt
      if (attempt === mergedOptions.maxAttempts) {
        return result;
      }

      const delay = calculateDelay(attempt, mergedOptions);
      logger.debug(`Retry attempt ${attempt}/${mergedOptions.maxAttempts} after ${delay}ms`, {
        error: String(result.error),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      lastResult = {
        data: null,
        error: error as E,
      };

      // Don't retry on non-retryable errors
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === mergedOptions.maxAttempts) {
        throw error;
      }

      const delay = calculateDelay(attempt, mergedOptions);
      logger.debug(`Retry attempt ${attempt}/${mergedOptions.maxAttempts} after ${delay}ms`, {
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return lastResult;
}
