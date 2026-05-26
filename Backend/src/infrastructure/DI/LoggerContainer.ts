import { LoggerService } from "../../application/services/LoggerService";
import { ILogger } from "../../domain/interfaces/ILogger";
import { WinstonLogger } from "../logging/WinstonLogger";

export class LoggerContainer {
  private static _instance: LoggerContainer;
  private _loggerService: LoggerService;

  private constructor() {
    // Infrastructure dependency
    const winstonLogger: ILogger = new WinstonLogger();

    // Application service with injected dependency
    this._loggerService = new LoggerService(winstonLogger);
  }

  public static getInstance(): LoggerContainer {
    if (!LoggerContainer._instance) {
      LoggerContainer._instance = new LoggerContainer();
    }
    return LoggerContainer._instance;
  }

  // Get the logger service instance
  public getLoggerService(): LoggerService {
    return this._loggerService;
  }

  //Get the raw logger instance (for infrastructure layer)
  public getLogger(): ILogger {
    const winstonLogger = new WinstonLogger();
    return winstonLogger;
  }
}
