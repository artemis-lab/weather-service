import { vi } from "vitest";

import type { ILogger } from "../../src/logger";
import type { IWeatherService } from "../../src/services";

export const createMockLogger = (): ILogger => ({
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
});

export const createMockWeatherService = (): IWeatherService => ({
  getForecast: vi.fn().mockResolvedValue({
    name: "This Afternoon",
    shortForecast: "Partly Cloudy",
    temperature: "cold" as const,
    location: {
      latitude: 39.7456,
      longitude: -97.0892,
    },
  }),
});
