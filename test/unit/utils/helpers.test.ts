import { describe, expect, it } from "vitest";

import { generateTraceId } from "../../../src/utils/helpers";

describe("generateTraceId", () => {
  it("should generate a trace ID with timestamp and random string", () => {
    const traceId = generateTraceId();

    expect(traceId).toMatch(/^\d+-[a-z0-9]{7}$/);
  });

  it("should generate unique trace IDs", () => {
    const traceId1 = generateTraceId();
    const traceId2 = generateTraceId();

    expect(traceId1).not.toBe(traceId2);
  });

  it("should include timestamp prefix", () => {
    const before = Date.now();
    const traceId = generateTraceId();
    const after = Date.now();

    const timestamp = parseInt(traceId.split("-")[0] ?? "0");

    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});
