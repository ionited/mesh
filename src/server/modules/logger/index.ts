import { pino } from "pino";
import { LoggerSettings } from "./settings";
import { IModule } from "../common"; 

export class Logger implements IModule {
  private readonly logger: pino.Logger;

  private readonly options: pino.LoggerOptions;

  constructor(settings: LoggerSettings) {
    this.options = {
      ...{
        level: "info",
        debug: process.env.NODE_ENV !== "production",
        name: "Logger",
      },
      ...settings,
    };

    if (settings.debug) {
      this.options = {
        ...this.options,
        ...{
          level: "debug",
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
            },
          },
        },
      };
    }

    this.logger = pino(this.options);
  }

  error(msg: unknown, ...args: any[]): this {
    this.logger.error(msg, ...args);
    return this;
  }

  warn(msg: unknown, ...args: any[]): this {
    this.logger.warn(msg, ...args);
    return this;
  }

  info(msg: unknown, ...args: any[]): this {
    this.logger.info(msg, ...args);
    return this;
  }

  debug(msg: unknown, ...args: any[]): this {
    this.logger.debug(msg, ...args);
    return this;
  }

  /**
   * Disposes of the logger resources, flushing any buffered logs.
   */
  dispose(): void {
    if (typeof this.logger.flush === "function") {
      this.logger.flush(); // Pino's flush is typically synchronous
    }
    // No other specific resources to release for a basic pino instance.
    // Transports might have their own cleanup, but pino.final or atexit handlers usually cover this.
    console.log("Logger disposed."); // Placeholder for actual disposal logic if any
  }
}
