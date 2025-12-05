/**
 * Logger interface for structured application logging.
 */
export interface ILogger {
  /**
   * Logs informational messages.
   * @param message - The message to log
   * @param metadata - Optional metadata to include with the log
   */
  info(message: string, metadata?: object): void;

  /**
   * Logs error messages.
   * @param message - The error message to log
   * @param error - Optional error object or additional context
   */
  error(message: string, error?: unknown): void;

  /**
   * Logs warning messages.
   * @param message - The warning message to log
   * @param metadata - Optional metadata to include with the log
   */
  warn(message: string, metadata?: object): void;

  /**
   * Logs debug messages for development and troubleshooting.
   * @param message - The debug message to log
   * @param metadata - Optional metadata to include with the log
   */
  debug(message: string, metadata?: object): void;
}
