import { ILogger } from "../../domain/interfaces/ILogger";

export class LoggerService {
  constructor(private _logger: ILogger) {}

  
  info(message: string, meta?: Record<string, unknown>): void {
    this._logger.info(message, meta);
  }


  error(message: string, meta?: Record<string, unknown>): void {
    this._logger.error(message, meta);
  }


  warn(message: string, meta?: Record<string, unknown>): void {
    this._logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this._logger.debug(message, meta);
  }

  
  http(message: string, meta?: Record<string, unknown>): void {
    this._logger.http(message, meta);
  }

  
  logUserAction(action: string, userId?: string, meta?: Record<string, unknown>): void {
    this.info(`User action: ${action}`, { userId, ...meta });
  }


  logApiRequest(method: string, url: string, userId?: string): void {
    this.http(`${method} ${url}`, { userId });
  }


  logApiResponse(method: string, url: string, statusCode: number, duration?: number): void {
    this.info(`${method} ${url} - ${statusCode}`, { statusCode, duration });
  }

  logError(error: Error, context?: string, meta?: Record<string, unknown>): void {
    this.error(`${context ? context + ": " : ""}${error.message}`, {
      stack: error.stack,
      ...meta,
    });
  }
}
