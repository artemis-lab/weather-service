import cors from "cors";
import express, { type Express, json, Response } from "express";

import { API_V1_WEATHER_PATH, DEFAULT_PORT, HEALTH_PATH } from "./constants";
import { Logger } from "./logger";
import { ErrorHandler } from "./middleware/error.middleware";
import { WeatherRoutes } from "./routes/weather.routes";
import { HealthCheckResponse } from "./types/weather.types";

const app: Express = express();
const logger = new Logger();

app.use(cors());
app.use(json());

// Health check
app.get(HEALTH_PATH, (_req, res: Response<HealthCheckResponse>) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
const weatherRoutes = new WeatherRoutes();
app.use(API_V1_WEATHER_PATH, weatherRoutes.router);

// Error handling
const errorHandler = new ErrorHandler();
app.use(errorHandler.handle);

app.listen(DEFAULT_PORT, () => {
  logger.info(`Server listening on port ${DEFAULT_PORT}`);
});
