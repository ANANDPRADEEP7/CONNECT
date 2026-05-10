import { LoggerService } from "../../application/services/LoggerService";
import { ILogger } from "../../domain/interfaces/ILogger";
import { WinstonLogger } from "../logging/WinstonLogger";

/**
 * Dependency Injection Container for Logger
 * Manages the lifecycle and dependencies of logger instances
 * Following Dependency Inversion Principle
 */
export class LoggerContainer {
  private static instance: LoggerContainer;
  private loggerService: LoggerService;

  private constructor() {
    // Infrastructure dependency
    const winstonLogger: ILogger = new WinstonLogger();

    // Application service with injected dependency
    this.loggerService = new LoggerService(winstonLogger);
  }

  public static getInstance(): LoggerContainer {
    if (!LoggerContainer.instance) {
      LoggerContainer.instance = new LoggerContainer();
    }
    return LoggerContainer.instance;
  }

  /**
   * Get the logger service instance
   */
  public getLoggerService(): LoggerService {
    return this.loggerService;
  }

  /**
   * Get the raw logger instance (for infrastructure layer)
   */
  public getLogger(): ILogger {
    const winstonLogger = new WinstonLogger();
    return winstonLogger;
  }
}
