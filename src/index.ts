import cors from "cors";
import express, { type Express, json, Response } from "express";
import type { Server } from "http";

import {
  API_V1_WEATHER_PATH,
  CORS_ORIGIN,
  HEALTH_PATH,
  PORT,
} from "./constants";
import { Logger } from "./logger";
import { ErrorHandler } from "./middleware/error.middleware";
import { WeatherRoutes } from "./routes/weather.routes";
import { HealthCheckResponse } from "./types/weather.types";

const logger = new Logger();

// Create and configure Express app
export const app: Express = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(json({ limit: "1mb" }));

// Log configuration
logger.info("Application configured", {
  corsOrigin: CORS_ORIGIN,
  nodeEnv: process.env.NODE_ENV,
  port: PORT,
});

// Health check
app.get(HEALTH_PATH, (_req, res: Response<HealthCheckResponse>) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes - share logger instance
const weatherRoutes = new WeatherRoutes(undefined, logger);
app.use(API_V1_WEATHER_PATH, weatherRoutes.router);

// Error handling - share logger instance
const errorHandler = new ErrorHandler(logger);
app.use(errorHandler.handle);

/**
 * Start the Express server with error handling and graceful shutdown.
 * @param port - Optional port number (defaults to PORT from environment/constants)
 */
export const startServer = (port: number = PORT): Server => {
  const server = app
    .listen(port, () => {
      logger.info(`Server listening on port ${port}`);
    })
    .on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        logger.error(`Port ${port} is already in use`);
      } else {
        logger.error("Failed to start server", { error: error.message });
      }
      process.exit(1);
    });

  // Graceful shutdown handler
  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);

    server.close(() => {
      logger.info("Server closed, exiting process");
      process.exit(0);
    });

    // Force shutdown after timeout (10s in production, 5s otherwise)
    const timeout = process.env.NODE_ENV === "production" ? 10000 : 5000;
    setTimeout(() => {
      logger.error("Forced shutdown due to timeout");
      process.exit(1);
    }, timeout).unref(); // unref allows process to exit if this is the only thing keeping it alive
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
};

// Only start server if this is the main module
if (require.main === module) {
  startServer();
}
