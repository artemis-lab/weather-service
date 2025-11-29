export interface WeatherForecastResponse {
  today: string;
  temperature: "hot" | "cold" | "moderate";
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface WeatherGovPoint {
  properties: {
    forecast: string;
  };
}

export interface WeatherGovForecast {
  properties: {
    periods: Array<{
      name: string;
      temperature: number;
      shortForecast: string;
    }>;
  };
}
