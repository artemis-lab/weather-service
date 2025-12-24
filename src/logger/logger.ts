import type { ILogger } from "./logger.interface";

export class Logger implements ILogger {
  info(message: string, metadata?: object): void {
    console.log(
      `[INFO] ${new Date().toISOString()} - ${message}`,
      metadata || "",
    );
  }

  error(message: string, error?: unknown): void {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error || "",
    );
  }

  warn(message: string, metadata?: object): void {
    console.warn(
      `[WARN] ${new Date().toISOString()} - ${message}`,
      metadata || "",
    );
  }

  debug(message: string, metadata?: object): void {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "test"
    ) {
      console.debug(
        `[DEBUG] ${new Date().toISOString()} - ${message}`,
        metadata || "",
      );
    }
  }
}
