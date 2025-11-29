import pRetry, { AbortError } from "p-retry";

import {
  TEMPERATURE_COLD_THRESHOLD,
  TEMPERATURE_HOT_THRESHOLD,
  WEATHER_API_BASE_URL,
  WEATHER_API_RETRY_ATTEMPTS,
  WEATHER_API_USER_AGENT,
} from "../constants";
import { ServiceUnavailableError } from "../errors/errors";
import type { ILogger } from "../logger";
import { Logger } from "../logger";
import type {
  Temperature,
  WeatherForecastResponse,
  WeatherGovForecast,
  WeatherGovPoint,
} from "../types/weather.types";
import { generateTraceId } from "../utils/helpers";
import type { IWeatherService } from "./weather-service.interface";

export class WeatherService implements IWeatherService {
  private logger: ILogger;

  constructor(logger: ILogger = new Logger()) {
    this.logger = logger;
  }

  async getForecast(
    latitude: number,
    longitude: number,
  ): Promise<WeatherForecastResponse> {
    const traceId = generateTraceId();
    this.logger.info("Fetching weather forecast", {
      traceId,
      latitude,
      longitude,
    });

    try {
      const forecastUrl = await this.getForecastUrl(
        latitude,
        longitude,
        traceId,
      );
      const forecast = await this.getForecastData(forecastUrl, traceId);
      const result = this.processData(forecast, latitude, longitude);

      this.logger.info("Weather forecast retrieved", { traceId, result });
      return result;
    } catch (error) {
      this.logger.error("Failed to fetch weather forecast", { traceId, error });
      throw error;
    }
  }

  private async getForecastUrl(
    latitude: number,
    longitude: number,
    traceId: string,
  ): Promise<string> {
    const url = `${WEATHER_API_BASE_URL}/points/${latitude},${longitude}`;

    const run = async () => {
      this.logger.debug("Fetching forecast URL", { traceId, url });
      const response = await this.fetchWithHeaders(url);
      const data: WeatherGovPoint = await response.json();

      if (!data.properties?.forecast) {
        throw new ServiceUnavailableError(
          "Invalid response from weather service",
        );
      }

      return data.properties.forecast;
    };

    return pRetry(run, {
      retries: WEATHER_API_RETRY_ATTEMPTS,
      onFailedAttempt: ({
        attemptNumber,
        error,
        retriesConsumed,
        retriesLeft,
      }) => {
        this.logger.warn(
          `Attempt ${attemptNumber} failed. ${retriesLeft} retries left. ${retriesConsumed} retries consumed`,
          { traceId, error: error.message },
        );
      },
    });
  }

  private async getForecastData(
    url: string,
    traceId: string,
  ): Promise<WeatherGovForecast> {
    const run = async () => {
      this.logger.debug("Fetching forecast data", { traceId, url });
      const response = await this.fetchWithHeaders(url);
      const data: WeatherGovForecast = await response.json();

      if (!data.properties?.periods?.length) {
        throw new ServiceUnavailableError("No forecast periods available");
      }

      return data;
    };

    return pRetry(run, {
      retries: WEATHER_API_RETRY_ATTEMPTS,
      onFailedAttempt: ({
        attemptNumber,
        error,
        retriesConsumed,
        retriesLeft,
      }) => {
        this.logger.warn(
          `Attempt ${attemptNumber} failed. ${retriesLeft} retries left. ${retriesConsumed} retries consumed`,
          { traceId, error: error.message },
        );
      },
    });
  }

  private async fetchWithHeaders(url: string): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        Accept: "application/geo+json",
        "User-Agent": WEATHER_API_USER_AGENT,
      },
    });

    if (response.status === 404) {
      throw new AbortError(
        "Location not found. Coordinates may be in an unsupported area.",
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableError(
        `Weather service returned status ${response.status}`,
      );
    }

    return response;
  }

  private processData(
    forecast: WeatherGovForecast,
    latitude: number,
    longitude: number,
  ): WeatherForecastResponse {
    const todayPeriod = forecast.properties.periods[0];
    if (!todayPeriod) {
      throw new ServiceUnavailableError("No today forecast period available");
    }

    return {
      location: { latitude, longitude },
      name: todayPeriod.name,
      temperature: this.categorizeTemperature(todayPeriod.temperature),
      shortForecast: todayPeriod.shortForecast,
    };
  }

  private categorizeTemperature(temperature: number): Temperature {
    if (temperature <= TEMPERATURE_COLD_THRESHOLD) {
      return "cold";
    }
    if (temperature >= TEMPERATURE_HOT_THRESHOLD) {
      return "hot";
    }
    return "moderate";
  }
}
