import { Request, Response, NextFunction } from "express";
import { LoggerContainer } from "../../infrastructure/DI/LoggerContainer";
import { TokenPayload } from "../../domain/interfaces/ITokenService";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * HTTP Request Logging Middleware - Presentation layer
 * Logs all incoming HTTP requests
 */
const loggerContainer = LoggerContainer.getInstance();
const loggerService = loggerContainer.getLoggerService();

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log incoming request
  loggerService.logApiRequest(req.method, req.route?.path || req.path, req.user?.id);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (this: Response, chunk?: any, encoding?: any, cb?: any): Response {
    const duration = Date.now() - startTime;
    loggerService.logApiResponse(req.method, req.route?.path || req.path, res.statusCode, duration);
    return originalEnd.call(this, chunk, encoding, cb);
  } as any;

  next();
};

/**
 * Error Logging Middleware - Presentation layer
 * Logs all errors that occur in the application
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  loggerService.logError(err, `${req.method} ${req.route?.path || req.path}`, {
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: req.user?.id,
  });

  next(err);
};
