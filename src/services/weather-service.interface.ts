import type { WeatherForecastResponse } from "../types/weather.types";

/**
 * Service for retrieving weather forecast from Weather.gov API.
 */
export interface IWeatherService {
  /**
   * Retrieves weather forecast for the specified coordinates.
   * @param latitude - Latitude coordinate (-90 to 90)
   * @param longitude - Longitude coordinate (-180 to 180)
   * @returns Promise resolving to weather forecast data
   * @throws {NotFoundError} When coordinates are not found in the system
   * @throws {ServiceUnavailableError} When the weather service is unavailable
   */
  getForecast(
    latitude: number,
    longitude: number,
  ): Promise<WeatherForecastResponse>;
}
