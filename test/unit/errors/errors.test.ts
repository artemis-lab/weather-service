import { describe, expect, it } from "vitest";

import {
  ApplicationError,
  BadGatewayError,
  GatewayTimeoutError,
  InternalServerError,
  NotFoundError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError,
} from "../../../src/errors/errors";

describe("Application Errors", () => {
  describe("ApplicationError", () => {
    it("should create error with status code and message", () => {
      const error = new ApplicationError(418, "I'm a teapot");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(418);
      expect(error.message).toBe("I'm a teapot");
      expect(error.name).toBe("ApplicationError");
    });
  });

  describe("ValidationError", () => {
    it("should create error with custom message", () => {
      const error = new ValidationError("Invalid input data");

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid input data");
      expect(error.name).toBe("ValidationError");
    });

    it("should create error with default message", () => {
      const error = new ValidationError();

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Validation failed");
      expect(error.name).toBe("ValidationError");
    });
  });

  describe("UnauthorizedError", () => {
    it("should create error with custom message", () => {
      const error = new UnauthorizedError("Invalid API key");

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Invalid API key");
      expect(error.name).toBe("UnauthorizedError");
    });

    it("should create error with default message", () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Unauthorized");
      expect(error.name).toBe("UnauthorizedError");
    });
  });

  describe("NotFoundError", () => {
    it("should create error with custom message", () => {
      const error = new NotFoundError("Location not found");

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Location not found");
      expect(error.name).toBe("NotFoundError");
    });

    it("should create error with default message", () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Resource not found");
      expect(error.name).toBe("NotFoundError");
    });
  });

  describe("InternalServerError", () => {
    it("should create error with custom message", () => {
      const error = new InternalServerError("Database connection failed");

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Database connection failed");
      expect(error.name).toBe("InternalServerError");
    });

    it("should create error with default message", () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Internal server error");
      expect(error.name).toBe("InternalServerError");
    });
  });

  describe("BadGatewayError", () => {
    it("should create error with custom message", () => {
      const error = new BadGatewayError("Upstream service error");

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(502);
      expect(error.message).toBe("Upstream service error");
      expect(error.name).toBe("BadGatewayError");
    });

    it("should create error with default message", () => {
      const error = new BadGatewayError();

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(502);
      expect(error.message).toBe("Bad gateway");
      expect(error.name).toBe("BadGatewayError");
    });
  });

  describe("ServiceUnavailableError", () => {
    it("should create error with custom message", () => {
      const error = new ServiceUnavailableError("Weather service is down");

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe("Weather service is down");
      expect(error.name).toBe("ServiceUnavailableError");
    });

    it("should create error with default message", () => {
      const error = new ServiceUnavailableError();

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe("Service unavailable");
      expect(error.name).toBe("ServiceUnavailableError");
    });
  });

  describe("GatewayTimeoutError", () => {
    it("should create error with custom message", () => {
      const error = new GatewayTimeoutError("Request timed out after 30s");

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(504);
      expect(error.message).toBe("Request timed out after 30s");
      expect(error.name).toBe("GatewayTimeoutError");
    });

    it("should create error with default message", () => {
      const error = new GatewayTimeoutError();

      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.statusCode).toBe(504);
      expect(error.message).toBe("Gateway timeout");
      expect(error.name).toBe("GatewayTimeoutError");
    });
  });
});
