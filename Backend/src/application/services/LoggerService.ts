import { ILogger } from "../../domain/interfaces/ILogger";


/**
 * Logger Service - Application layer
 * Provides logging functionality to the application layer
 * Depends on abstraction (ILogger) not concrete implementation
 */
export class LoggerService {
  constructor(private logger: ILogger) {}

  /**
   * Log informational message
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log error message
   */
  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log HTTP request
   */
  http(message: string, meta?: any): void {
    this.logger.http(message, meta);
  }

  /**
   * Log user action
   */
  logUserAction(action: string, userId?: string, meta?: any): void {
    this.info(`User action: ${action}`, { userId, ...meta });
  }

  /**
   * Log API request
   */
  logApiRequest(method: string, url: string, userId?: string): void {
    this.http(`${method} ${url}`, { userId });
  }

  /**
   * Log API response
   */
  logApiResponse(method: string, url: string, statusCode: number, duration?: number): void {
    this.info(`${method} ${url} - ${statusCode}`, { statusCode, duration });
  }

  /**
   * Log error with context
   */
  logError(error: Error, context?: string, meta?: any): void {
    this.error(`${context ? context + ': ' : ''}${error.message}`, {
      stack: error.stack,
      ...meta
    });
  }
}
