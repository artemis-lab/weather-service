import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  API_V1_PATH,
  CORS_ORIGIN,
  FORECAST_PATH,
  HEALTH_PATH,
  PORT,
  RATE_LIMIT_MAX_REQUESTS,
  RATE_LIMIT_WINDOW_MS,
  REQUEST_BODY_LIMIT,
  TEMPERATURE_COLD_THRESHOLD,
  TEMPERATURE_HOT_THRESHOLD,
  WEATHER_API_BASE_URL,
  WEATHER_API_RETRY_ATTEMPTS,
  WEATHER_API_USER_AGENT,
} from "../../../src/constants";

describe("Constants", () => {
  it("should have correct server configuration", () => {
    expect(CORS_ORIGIN).toBe("*");
    expect(PORT).toBe(3000);
    expect(REQUEST_BODY_LIMIT).toBe("1mb");
  });

  it("should have correct API paths", () => {
    expect(API_V1_PATH).toBe("/v1");
    expect(FORECAST_PATH).toBe("/forecast/:coordinates");
    expect(HEALTH_PATH).toBe("/health");
  });

  it("should have correct temperature thresholds", () => {
    expect(TEMPERATURE_COLD_THRESHOLD).toBe(50);
    expect(TEMPERATURE_HOT_THRESHOLD).toBe(80);
  });

  it("should have correct weather API constants", () => {
    expect(WEATHER_API_BASE_URL).toBe("https://api.weather.gov");
    expect(WEATHER_API_RETRY_ATTEMPTS).toBe(3);
    expect(WEATHER_API_USER_AGENT).toBe("WeatherService/1.0");
  });

  describe("test environment", () => {
    it("should have correct rate limiting constants for test environment", () => {
      expect(RATE_LIMIT_MAX_REQUESTS).toBe(5);
      expect(RATE_LIMIT_WINDOW_MS).toBe(50);
    });
  });

  describe("production environment", () => {
    beforeEach(async () => {
      vi.resetModules();
      process.env.NODE_ENV = "production";
    });

    afterEach(() => {
      process.env.NODE_ENV = "test";
    });

    it("should have correct rate limiting constants for production environment", async () => {
      const constants = await import("../../../src/constants/index.js");

      expect(constants.RATE_LIMIT_MAX_REQUESTS).toBe(100);
      expect(constants.RATE_LIMIT_WINDOW_MS).toBe(15 * 60 * 1000);
    });
  });
});
