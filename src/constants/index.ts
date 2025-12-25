// Server configuration
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
export const PORT = Number(process.env.PORT) || 3000;
export const REQUEST_BODY_LIMIT = "1mb";

// Paths
export const API_V1_PATH = "/v1";
export const FORECAST_PATH = "/forecast/:coordinates";
export const HEALTH_PATH = "/health";

// Rate limiting constants
// Use lower limits in test environment for faster tests
export const RATE_LIMIT_MAX_REQUESTS =
  process.env.NODE_ENV === "test" ? 5 : 100;
export const RATE_LIMIT_WINDOW_MS =
  process.env.NODE_ENV === "test" ? 50 : 15 * 60 * 1000; // 50ms in test, 15min in prod

// Temperature thresholds
export const TEMPERATURE_COLD_THRESHOLD = 50;
export const TEMPERATURE_HOT_THRESHOLD = 80;

// Weather API constants
export const WEATHER_API_BASE_URL = "https://api.weather.gov";
export const WEATHER_API_RETRY_ATTEMPTS = 3;
export const WEATHER_API_USER_AGENT = "WeatherService/1.0";
