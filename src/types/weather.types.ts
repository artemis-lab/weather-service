export type Temperature = "cold" | "hot" | "moderate";

export interface WeatherForecastResponse {
  location: {
    latitude: number;
    longitude: number;
  };
  name: string;
  shortForecast: string;
  temperature: Temperature;
}

export interface WeatherGovForecast {
  properties: {
    periods: Array<{
      name: string;
      shortForecast: string;
      temperature: number;
    }>;
  };
}

export interface WeatherGovPoint {
  properties: {
    forecast: string;
  };
}
