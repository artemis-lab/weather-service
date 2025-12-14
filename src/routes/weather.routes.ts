import { Router } from "express";

import { FORECAST_PATH } from "../constants";
import { WeatherController } from "../controllers/weather.controller";
import type { ILogger } from "../logger";

/**
 * Configures routes for weather-related endpoints.
 */
export class WeatherRoutes {
  router = Router();
  private controller: WeatherController;

  constructor(controller?: WeatherController, logger?: ILogger) {
    this.controller = controller || new WeatherController(undefined, logger);
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get(FORECAST_PATH, this.controller.getForecast);
  }
}
