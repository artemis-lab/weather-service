import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { API_V1_PATH, RATE_LIMIT_MAX_REQUESTS } from "../../../src/constants";
import { app } from "../../../src/index";
import { waitForRateLimitReset } from "../../setup";

describe("Rate Limiter Integration", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await waitForRateLimitReset();
  });

  it("should allow requests within the rate limit", async () => {
    // Make RATE_LIMIT_MAX_REQUESTS requests (exactly at the limit)
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.headers["ratelimit-limit"]).toBe(
        String(RATE_LIMIT_MAX_REQUESTS),
      );
      expect(response.headers["ratelimit-remaining"]).toBeDefined();
      expect(response.headers["ratelimit-reset"]).toBeDefined();
    }
  });

  it("should not have legacy X-RateLimit headers", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["x-ratelimit-limit"]).toBeUndefined();
    expect(response.headers["x-ratelimit-remaining"]).toBeUndefined();
    expect(response.headers["x-ratelimit-reset"]).toBeUndefined();
  });

  it("should return 429 when rate limit is exceeded", async () => {
    // Make exactly RATE_LIMIT_MAX_REQUESTS requests to exhaust the limit
    for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
    }

    // The next request should be rate limited
    const response = await request(app).get("/health");
    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      success: false,
      error: "TooManyRequestsError",
      message: "Too many requests, please try again later",
    });
    expect(response.headers["ratelimit-limit"]).toBe(
      String(RATE_LIMIT_MAX_REQUESTS),
    );
    expect(response.headers["ratelimit-remaining"]).toBe("0");
    expect(response.headers["ratelimit-reset"]).toBeDefined();

    // Verify subsequent requests are also rate limited
    const nextResponse = await request(app).get("/health");
    expect(nextResponse.status).toBe(429);
  });

  it("should apply rate limiting to successful API requests", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          properties: {
            forecast: "https://api.weather.gov/gridpoints/TOP/32,81/forecast",
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          properties: {
            periods: [
              {
                name: "This Afternoon",
                temperature: 36,
                shortForecast: "Partly Cloudy",
              },
            ],
          },
        }),
      } as Response);

    const response = await request(app).get("/v1/forecast/39.7456,-97.0892");

    expect(response.status).toBe(200);
    expect(response.headers["ratelimit-limit"]).toBe(
      String(RATE_LIMIT_MAX_REQUESTS),
    );
    expect(response.headers["ratelimit-remaining"]).toBeDefined();
    expect(response.headers["ratelimit-reset"]).toBeDefined();
  });

  it("should apply rate limiting to failed API requests", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response);

    const response = await request(app).get(`${API_V1_PATH}/forecast/0,0`);

    expect(response.status).toBe(404);
    expect(response.headers["ratelimit-limit"]).toBe(
      String(RATE_LIMIT_MAX_REQUESTS),
    );
    expect(response.headers["ratelimit-remaining"]).toBeDefined();
    expect(response.headers["ratelimit-reset"]).toBeDefined();
  });
});
