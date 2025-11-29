import type { WeatherForecastResponse } from "../types/weather.types";

export interface IWeatherService {
  getForecast(
    latitude: number,
    longitude: number,
  ): Promise<WeatherForecastResponse>;
}
