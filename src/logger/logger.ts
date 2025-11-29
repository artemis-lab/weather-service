import type { ILogger } from "./logger.interface";

export class Logger implements ILogger {
  info(message: string, meta?: object): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || "");
  }

  error(message: string, error?: unknown): void {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error || "",
    );
  }

  warn(message: string, meta?: object): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || "");
  }

  debug(message: string, meta?: object): void {
    console.debug(
      `[DEBUG] ${new Date().toISOString()} - ${message}`,
      meta || "",
    );
  }
}
