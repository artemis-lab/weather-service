import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApplicationError } from "../errors/errors";
import type { ILogger } from "../logger";
import { Logger } from "../logger";
import type { ErrorResponse } from "../types/weather.types";

/**
 * Centralized error handling middleware for the application.
 */
export class ErrorHandler {
  private logger: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger || new Logger();
  }

  /**
   * Handles errors and sends appropriate HTTP responses.
   * @param error - The error to handle
   * @param request - Express request
   * @param response - Express response
   * @param _next - Express next function (unused)
   */
  handle = (
    error: Error,
    request: Request,
    response: Response<ErrorResponse>,
    _next: NextFunction,
  ): void => {
    this.logger.error("Error occurred", {
      path: request.path,
      method: request.method,
      error: error.message,
    });

    if (error instanceof ZodError) {
      response.status(400).json({
        success: false,
        error: "Validation Error",
        message: error.issues[0]?.message || "Invalid input",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (error instanceof ApplicationError) {
      response.status(error.statusCode).json({
        success: false,
        error: error.name,
        message: error.message,
      });
      return;
    }

    response.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  };
}
