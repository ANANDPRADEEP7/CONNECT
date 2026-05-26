import { Response, NextFunction } from "express";
import { LoggerContainer } from "../../infrastructure/DI/LoggerContainer";
import { AuthRequest } from "./AuthMiddleware";

const loggerContainer = LoggerContainer.getInstance();
const loggerService = loggerContainer.getLoggerService();

export const requestLogger = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log incoming request
  loggerService.logApiRequest(req.method, req.route?.path || req.path, req.user?.id);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (this: Response, ...args: Parameters<typeof res.end>): Response {
    const duration = Date.now() - startTime;
    loggerService.logApiResponse(req.method, req.route?.path || req.path, res.statusCode, duration);
    return originalEnd.call(this, ...(args as Parameters<typeof res.end>));
  } as typeof res.end;

  next();
};

export const errorLogger = (
  err: Error,
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  loggerService.logError(err, `${req.method} ${req.route?.path || req.path}`, {
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: req.user?.id,
  });

  next(err);
};
