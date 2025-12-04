import { vi } from "vitest";

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
