import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { API_V1_PATH } from "../../../src/constants";
import { NotFoundError, ValidationError } from "../../../src/errors/errors";
import type { ILogger } from "../../../src/logger";
import { ErrorHandler } from "../../../src/middleware/error.middleware";
import { createMockLogger } from "../../helpers/mocks";

describe("ErrorHandler", () => {
  let errorHandler: ErrorHandler;
  let mockLogger: ILogger;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockLogger = createMockLogger();
    errorHandler = new ErrorHandler(mockLogger);

    mockRequest = {
      path: `${API_V1_PATH}/forecast/39.7456,-97.0892`,
      method: "GET",
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe("constructor", () => {
    it("should use default logger when none is provided", () => {
      const handlerWithDefaultLogger = new ErrorHandler();
      const error = new Error("Test error");

      expect(() => {
        handlerWithDefaultLogger.handle(
          error,
          mockRequest as Request,
          mockResponse as Response,
          mockNext,
        );
      }).not.toThrow();

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    });
  });

  describe("handle", () => {
    it("should handle ZodError with 400 status", () => {
      const zodError = new ZodError([
        {
          origin: "number",
          code: "too_small",
          minimum: -180,
          inclusive: true,
          path: ["latitude"],
          message: "Latitude must be between -180 and 180",
        },
      ]);

      errorHandler.handle(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Validation Error",
        message: "Latitude must be between -180 and 180",
        details: [
          {
            field: "latitude",
            message: "Latitude must be between -180 and 180",
          },
        ],
      });
    });

    it("should handle ZodError without message with 400 status", () => {
      const zodError = new ZodError([
        {
          origin: "number",
          code: "too_small",
          minimum: -180,
          inclusive: true,
          path: ["latitude"],
          message: "",
        },
      ]);

      errorHandler.handle(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Validation Error",
        message: "Invalid input",
        details: [
          {
            field: "latitude",
            message: "",
          },
        ],
      });
    });

    it("should handle ValidationError with 400 status", () => {
      const validationError = new ValidationError("Invalid input");

      errorHandler.handle(
        validationError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "ValidationError",
        message: "Invalid input",
      });
    });

    it("should handle ApplicationError with correct status code", () => {
      const notFoundError = new NotFoundError("Resource not found");

      errorHandler.handle(
        notFoundError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "NotFoundError",
        message: "Resource not found",
      });
    });

    it("should handle unknown error with 500 status", () => {
      const unknownError = new Error("Something went wrong");

      errorHandler.handle(
        unknownError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    });

    it("should handle TypeError as unknown error", () => {
      const typeError = new TypeError("Cannot read property of undefined");

      errorHandler.handle(
        typeError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      });
    });

    it("should log error details", () => {
      const error = new Error("Test error");

      errorHandler.handle(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockLogger.error).toHaveBeenCalledWith("Error occurred", {
        path: "/v1/forecast/39.7456,-97.0892",
        method: "GET",
        error: "Test error",
      });
    });
  });
});
