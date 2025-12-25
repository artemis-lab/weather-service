import { vi } from "vitest";

import { RATE_LIMIT_WINDOW_MS } from "../src/constants";

/**
 * Mock p-retry to remove delays in tests for faster execution.
 * This still tests retry logic (count, shouldRetry, errors) but skips the waiting.
 */
vi.mock("p-retry", async () => {
  const actual = await vi.importActual<typeof import("p-retry")>("p-retry");
  return {
    default: async (fn: () => Promise<any>, options?: any) => {
      return actual.default(fn, {
        ...options,
        factor: 1,
        minTimeout: 0,
        maxTimeout: 0,
      });
    },
  };
});

/**
 * Wait for the rate limit window to expire.
 * This should be called in afterEach to ensure tests don't interfere with each other.
 */
export const waitForRateLimitReset = async (): Promise<void> => {
  // Wait for window + 50% buffer to ensure it's fully expired
  await new Promise((resolve) =>
    setTimeout(resolve, RATE_LIMIT_WINDOW_MS * 1.5),
  );
};
