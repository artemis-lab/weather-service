import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../errors/errors";
import type { IWeatherService } from "../services";
import { WeatherService } from "../services";
import {
  CoordinatesParams,
  WeatherForecastResponse,
} from "../types/weather.types";
import { coordinatesSchema } from "../validators/weather.validator";

export class WeatherController {
  private weatherService: IWeatherService;

  constructor(weatherService?: IWeatherService) {
    this.weatherService = weatherService || new WeatherService();
  }

  getForecast = async (
    request: Request<CoordinatesParams, WeatherForecastResponse>,
    response: Response<WeatherForecastResponse>,
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

      response.status(200).json(forecast);
    } catch (error) {
      next(error);
    }
  };
}
