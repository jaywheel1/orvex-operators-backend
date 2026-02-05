/**
 * Input sanitization and validation utilities
 * Ensures user inputs are safe and valid before processing
 */

/**
 * Validate and sanitize wallet address
 */
export function sanitizeWallet(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Wallet address must be a string');
  }

  const wallet = input.trim().toLowerCase();

  // Basic Ethereum address validation (0x + 40 hex chars)
  if (!/^0x[a-f0-9]{40}$/.test(wallet)) {
    throw new Error('Invalid wallet address format');
  }

  return wallet;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('URL must be a string');
  }

  const url = input.trim();

  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs are allowed');
    }

    return url;
  } catch (error) {
    throw new Error(`Invalid URL format: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validate Twitter/X URL format
 */
export function validateTwitterUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const isTwitter = parsed.hostname.includes('twitter.com') || parsed.hostname.includes('x.com');
    const hasStatus = parsed.pathname.includes('/status/');
    return isTwitter && hasStatus;
  } catch {
    return false;
  }
}

/**
 * Sanitize string to prevent injection attacks
 */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Trim and limit length
  let sanitized = input.trim().substring(0, maxLength);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  return sanitized;
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSizeBytes = 10 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSizeBytes;
}

/**
 * Validate file type (MIME type)
 */
export function validateFileType(mimeType: unknown, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']): boolean {
  if (typeof mimeType !== 'string') {
    return false;
  }

  return allowedTypes.includes(mimeType.toLowerCase());
}

/**
 * Sanitize and validate file metadata
 */
export interface FileSanitizationOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export function sanitizeFile(
  file: File,
  options: FileSanitizationOptions = {}
): { isValid: boolean; error?: string } {
  const { maxSizeBytes = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;

  // Validate file size
  if (!validateFileSize(file.size, maxSizeBytes)) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`,
    };
  }

  // Validate file type
  if (!validateFileType(file.type, allowedTypes)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Validate file name
  const sanitizedName = file.name.replace(/[^a-z0-9._-]/gi, '_');
  if (sanitizedName !== file.name) {
    console.warn(`File name contains unsafe characters: ${file.name}`);
  }

  return { isValid: true };
}

/**
 * Validate JSON input safely
 */
export function validateJson<T>(input: unknown, schema?: (data: T) => boolean): T {
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (schema && !schema(parsed)) {
        throw new Error('Input does not match expected schema');
      }
      return parsed as T;
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (schema && !schema(input as T)) {
    throw new Error('Input does not match expected schema');
  }

  return input as T;
}

/**
 * Sanitize environment variables (ensure they exist and are strings)
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

/**
 * Sanitize environment variables with a default fallback
 */
export function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}
