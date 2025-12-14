import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_V1_WEATHER_PATH } from "../../../src/constants";
import { app } from "../../../src/index";

describe("WeatherRoutes", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET /forecast/:coordinates", () => {
    it("should return 200 with forecast data for valid coordinates", async () => {
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

      const response = await request(app).get(
        `${API_V1_WEATHER_PATH}/forecast/39.7456,-97.0892`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          name: "This Afternoon",
          shortForecast: "Partly Cloudy",
          temperature: "cold",
          location: {
            latitude: 39.7456,
            longitude: -97.0892,
          },
        },
      });
    });

    it("should return 404 when location is not found", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const response = await request(app).get(
        `${API_V1_WEATHER_PATH}/forecast/0,0`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        error: "NotFoundError",
      });
    });

    it("should return 503 when weather service is unavailable", async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const response = await request(app).get(
        `${API_V1_WEATHER_PATH}/forecast/39.7456,-97.0892`,
      );

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        success: false,
        error: "ServiceUnavailableError",
      });
    });

    it("should return 400 for invalid coordinates format", async () => {
      const response = await request(app).get(
        `${API_V1_WEATHER_PATH}/forecast/invalid`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        error: "ValidationError",
      });
    });

    it("should return 400 for out-of-range latitude", async () => {
      const response = await request(app).get(
        `${API_V1_WEATHER_PATH}/forecast/999,-97.0892`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
      });
    });

    it("should return 400 for out-of-range longitude", async () => {
      const response = await request(app).get(
        `${API_V1_WEATHER_PATH}/forecast/39.7456,999`,
      );

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
      });
    });

    it("should return 400 for empty coordinates", async () => {
      const response = await request(app).get(
        `${API_V1_WEATHER_PATH}/forecast/,`,
      );

      expect(response.status).toBe(400);
    });
  });
});
