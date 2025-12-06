import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  NotFoundError,
  ServiceUnavailableError,
} from "../../../src/errors/errors";
import type { ILogger } from "../../../src/logger";
import { WeatherService } from "../../../src/services/weather.service";
import { createMockLogger } from "../../helpers/mocks";

describe("WeatherService", () => {
  let service: WeatherService;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockLogger = createMockLogger();
    service = new WeatherService(mockLogger);

    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getForecast", () => {
    it("should return forecast data for valid coordinates", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            properties: {
              forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            properties: {
              periods: [
                {
                  name: "This Afternoon",
                  temperature: 36,
                  shortForecast: "Partly Cloudy",
                },
              ],
            },
          }),
        } as Response);

      const result = await service.getForecast(39.7456, -97.0892);

      expect(result).toEqual({
        name: "This Afternoon",
        shortForecast: "Partly Cloudy",
        temperature: "cold",
        location: {
          latitude: 39.7456,
          longitude: -97.0892,
        },
      });
    });

    it("should throw NotFoundError for 404 response", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(service.getForecast(0, 0)).rejects.toThrow(NotFoundError);
    });

    it("should throw ServiceUnavailableError for non-200 response", async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(service.getForecast(39.7456, -97.0892)).rejects.toThrow(
        ServiceUnavailableError,
      );
    });

    it("should throw ServiceUnavailableError when forecast URL is missing", async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          properties: {},
        }),
      } as Response);

      const promise = service.getForecast(39.7456, -97.0892);

      await expect(promise).rejects.toThrow(ServiceUnavailableError);
      await expect(promise).rejects.toThrow(
        "Invalid response from weather service",
      );
    });

    it("should throw ServiceUnavailableError when forecast periods are missing", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
            },
          }),
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            properties: {
              periods: [],
            },
          }),
        } as Response);

      const promise = service.getForecast(39.7456, -97.0892);

      await expect(promise).rejects.toThrow(ServiceUnavailableError);
      await expect(promise).rejects.toThrow("No forecast periods available");
    });

    it("should throw ServiceUnavailableError when today forecast period is undefined", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              periods: [undefined],
            },
          }),
        } as Response);

      const promise = service.getForecast(39.7456, -97.0892);

      await expect(promise).rejects.toThrow(ServiceUnavailableError);
      await expect(promise).rejects.toThrow(
        "No today forecast period available",
      );
    });

    it("should log warning message when retrying getForecastUrl", async () => {
      vi.mocked(global.fetch)
        // First attempt fails
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
        } as Response)
        // Second attempt succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              periods: [
                {
                  name: "This Afternoon",
                  temperature: 36,
                  shortForecast: "Partly Cloudy",
                },
              ],
            },
          }),
        } as Response);

      const result = await service.getForecast(39.7456, -97.0892);

      expect(result.temperature).toBe("cold");
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Attempt"),
        expect.objectContaining({
          traceId: expect.any(String),
          error: expect.any(String),
        }),
      );
    });

    it("should log warning message when retrying getForecastData", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
            },
          }),
        } as Response)
        // First attempt fails
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
        } as Response)
        // Second attempt succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              periods: [
                {
                  name: "This Morning",
                  temperature: 65,
                  shortForecast: "Sunny",
                },
              ],
            },
          }),
        } as Response);

      const result = await service.getForecast(39.7456, -97.0892);

      expect(result.temperature).toBe("moderate");
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Attempt"),
        expect.objectContaining({
          traceId: expect.any(String),
          error: expect.any(String),
        }),
      );
    });

    it("should not retry when NotFoundError occurs in getForecastData", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        } as Response);

      await expect(service.getForecast(39.7456, -97.0892)).rejects.toThrow(
        NotFoundError,
      );

      // Verify fetch was only called twice (no retries on 404)
      expect(global.fetch).toHaveBeenCalledTimes(2);

      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Attempt"),
        expect.objectContaining({
          error: expect.any(String),
        }),
      );
    });

    it("should categorize temperature as cold", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              periods: [
                {
                  name: "This Afternoon",
                  temperature: 45,
                  shortForecast: "Partly Cloudy",
                },
              ],
            },
          }),
        } as Response);

      const result = await service.getForecast(39.7456, -97.0892);

      expect(result.temperature).toBe("cold");
    });

    it("should categorize temperature as moderate", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              periods: [
                {
                  name: "This Afternoon",
                  temperature: 65,
                  shortForecast: "Pleasant",
                },
              ],
            },
          }),
        } as Response);

      const result = await service.getForecast(39.7456, -97.0892);

      expect(result.temperature).toBe("moderate");
    });

    it("should categorize temperature as hot", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            properties: {
              periods: [
                {
                  name: "This Afternoon",
                  temperature: 85,
                  shortForecast: "Sunny",
                },
              ],
            },
          }),
        } as Response);

      const result = await service.getForecast(39.7456, -97.0892);

      expect(result.temperature).toBe("hot");
    });
  });
});
