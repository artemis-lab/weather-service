// Weather API types
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

// Request/Response types
export interface CoordinatesParams {
  coordinates: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface HealthCheckResponse {
  status: "ok";
  timestamp: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type Temperature = "cold" | "hot" | "moderate";

export interface WeatherForecastResponse {
  name: string;
  shortForecast: string;
  temperature: Temperature;
  location: {
    latitude: number;
    longitude: number;
  };
}
