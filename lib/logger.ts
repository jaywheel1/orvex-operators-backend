/**
 * Structured logging service for consistent logging across the application
 * Provides methods for different log levels with metadata support
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error && {
        error: {
          message: error.message,
          ...(this.isDevelopment && { stack: error.stack }),
        },
      }),
    };
  }

  private output(entry: LogEntry): void {
    const logFn = this.getConsoleMethod(entry.level);
    logFn(JSON.stringify(entry));
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      default:
        return console.log;
    }
  }

  debug(message: string, context?: LogContext): void {
    const entry = this.formatLog('debug', message, context);
    if (this.isDevelopment) {
      this.output(entry);
    }
  }

  info(message: string, context?: LogContext): void {
    const entry = this.formatLog('info', message, context);
    this.output(entry);
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.formatLog('warn', message, context);
    this.output(entry);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.formatLog('error', message, context, error);
    this.output(entry);
  }

  /**
   * Log API request with metadata
   */
  logRequest(method: string, url: string, statusCode?: number, duration?: number): void {
    this.info('API Request', {
      method,
      url,
      statusCode,
      durationMs: duration,
    });
  }

  /**
   * Log API error response
   */
  logApiError(method: string, url: string, statusCode: number, message: string, error?: Error): void {
    this.error(`API Error: ${method} ${url}`, error, {
      method,
      url,
      statusCode,
      message,
    });
  }

  /**
   * Log database operation
   */
  logDatabase(operation: string, table: string, duration?: number, error?: Error): void {
    if (error) {
      this.error(`Database Error: ${operation} on ${table}`, error, { operation, table, durationMs: duration });
    } else {
      this.debug(`Database: ${operation} on ${table}`, { operation, table, durationMs: duration });
    }
  }

  /**
   * Log authentication event
   */
  logAuth(event: string, wallet: string, success: boolean, details?: LogContext): void {
    this.info(`Auth: ${event}`, {
      event,
      wallet: wallet.slice(0, 6) + '...' + wallet.slice(-4), // Redact for privacy
      success,
      ...details,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Also export as default for convenience
export default logger;
