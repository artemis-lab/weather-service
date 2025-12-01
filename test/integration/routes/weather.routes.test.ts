import express, { type Express } from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

import { API_V1_WEATHER_PATH } from "../../../src/constants";
import { ErrorHandler } from "../../../src/middleware/error.middleware";
import { WeatherRoutes } from "../../../src/routes/weather.routes";

describe("WeatherRoutes", () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    const routes = new WeatherRoutes();
    app.use(API_V1_WEATHER_PATH, routes.router);

    const errorHandler = new ErrorHandler();
    app.use(errorHandler.handle);
  });

  describe("GET /forecast/:coordinates", () => {
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
