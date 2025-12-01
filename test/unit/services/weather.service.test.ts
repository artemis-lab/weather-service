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

      await expect(service.getForecast(39, -97)).rejects.toThrow(
        ServiceUnavailableError,
      );
    }, 10000);

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
