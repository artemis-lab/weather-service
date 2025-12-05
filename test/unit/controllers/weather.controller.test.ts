import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WeatherController } from "../../../src/controllers/weather.controller";
import { ValidationError } from "../../../src/errors/errors";
import type { IWeatherService } from "../../../src/services";
import { createMockWeatherService } from "../../helpers/mocks";

describe("WeatherController", () => {
  let controller: WeatherController;
  let mockService: IWeatherService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockService = createMockWeatherService();
    controller = new WeatherController(mockService);

    mockRequest = {
      params: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe("getForecast", () => {
    it("should return 200 with forecast data for valid coordinates", async () => {
      mockRequest.params = { coordinates: "39.7456,-97.0892" };

      await controller.getForecast(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          name: "This Afternoon",
          shortForecast: "Partly Cloudy",
          temperature: "cold",
        }),
      });
    });

    it("should call weatherService.getForecast with correct coordinates", async () => {
      mockRequest.params = { coordinates: "39.7456,-97.0892" };

      await controller.getForecast(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );

      expect(mockService.getForecast).toHaveBeenCalledWith(39.7456, -97.0892);
    });

    it("should call next with ValidationError for empty coordinates", async () => {
      mockRequest.params = { coordinates: "" };

      await controller.getForecast(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should call next with ValidationError for missing comma", async () => {
      mockRequest.params = { coordinates: "invalid" };

      await controller.getForecast(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    it("should call next with ZodError for too small out-of-range latitude", async () => {
      mockRequest.params = { coordinates: "-999,-97.0892" };

      await controller.getForecast(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next with ZodError for too big out-of-range latitude", async () => {
      mockRequest.params = { coordinates: "999,-97.0892" };

      await controller.getForecast(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next with ZodError for too small out-of-range longitude", async () => {
      mockRequest.params = { coordinates: "39.7456,-999" };

      await controller.getForecast(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("should call next with ZodError for too big out-of-range longitude", async () => {
      mockRequest.params = { coordinates: "39.7456,999" };

      await controller.getForecast(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      mockRequest.params = { coordinates: "39.7456,-97.0892" };
      const error = new Error("Service error");
      vi.mocked(mockService.getForecast).mockRejectedValue(error);

      await controller.getForecast(
        mockRequest as any,
        mockResponse as any,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
