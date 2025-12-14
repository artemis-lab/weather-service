import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../errors/errors";
import type { ILogger } from "../logger";
import type { IWeatherService } from "../services";
import { WeatherService } from "../services";
import {
  CoordinatesParams,
  SuccessResponse,
  WeatherForecastResponse,
} from "../types/weather.types";
import { coordinatesSchema } from "../validators/weather.validator";

/**
 * Handles HTTP requests for weather forecast.
 */
export class WeatherController {
  private weatherService: IWeatherService;

  constructor(weatherService?: IWeatherService, logger?: ILogger) {
    this.weatherService = weatherService || new WeatherService(logger);
  }

  /**
   * Retrieves weather forecast for the given coordinates.
   * @param request - Express request with coordinates in params
   * @param response - Express response
   * @param next - Express next function for error handling
   */
  getForecast = async (
    request: Request<CoordinatesParams>,
    response: Response<SuccessResponse<WeatherForecastResponse>>,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const coordinates = request.params.coordinates;

      if (!coordinates || !coordinates.includes(",")) {
        throw new ValidationError(
          "Invalid coordinates format. Expected: {latitude},{longitude}",
        );
      }

      const [latitude, longitude] = coordinates.split(",");
      const validated = coordinatesSchema.parse({ latitude, longitude });

      const forecast = await this.weatherService.getForecast(
        validated.latitude,
        validated.longitude,
      );

      response.status(200).json({ success: true, data: forecast });
    } catch (error) {
      next(error);
    }
  };
}
