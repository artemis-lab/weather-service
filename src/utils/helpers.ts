/**
 * Generates a unique trace ID for request tracking.
 * @returns A trace ID in the format "timestamp-randomstring"
 * @example
 * const traceId = generateTraceId();
 * // Returns: "1764482607707-a1b2c3d"
 */
export const generateTraceId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
