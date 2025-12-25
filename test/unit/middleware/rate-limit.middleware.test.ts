import { describe, expect, it } from "vitest";

import { rateLimiter } from "../../../src/middleware/rate-limit.middleware";

describe("Rate Limiter Middleware", () => {
  it("should be defined", () => {
    expect(rateLimiter).toBeDefined();
  });

  it("should be a function", () => {
    expect(typeof rateLimiter).toBe("function");
  });

  it("should have getKey method", () => {
    expect(rateLimiter.getKey).toBeDefined();
    expect(typeof rateLimiter.getKey).toBe("function");
  });

  it("should have resetKey method", () => {
    expect(rateLimiter.resetKey).toBeDefined();
    expect(typeof rateLimiter.resetKey).toBe("function");
  });

  it("should call getKey to retrieve rate limit info for a key", async () => {
    const testKey = "test-key-127.0.0.1";

    const result = await rateLimiter.getKey(testKey);
    // Key might not exist yet, so it could be undefined
    expect(result === undefined || typeof result === "object").toBe(true);
  });

  it("should call resetKey to reset rate limit for a key", () => {
    const testKey = "test-key-127.0.0.1";

    expect(() => rateLimiter.resetKey(testKey)).not.toThrow();
  });
});
