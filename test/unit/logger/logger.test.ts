import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Logger } from "../../../src/logger";

describe("Logger", () => {
  let logger: Logger;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logger = new Logger();

    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("info", () => {
    it("should log info message without metadata", () => {
      logger.info("Test info message");

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]"),
        "",
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test info message"),
        "",
      );
    });

    it("should log info message with metadata", () => {
      const metadata = { userId: 123, action: "login" };

      logger.info("User logged in", metadata);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]"),
        metadata,
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("User logged in"),
        metadata,
      );
    });

    it("should include ISO timestamp in log", () => {
      logger.info("Test message");

      const logCall = consoleLogSpy.mock.calls[0][0];
      expect(logCall).toMatch(
        /\[INFO\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - Test message/,
      );
    });
  });

  describe("error", () => {
    it("should log error message without error object", () => {
      logger.error("Test error message");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]"),
        "",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test error message"),
        "",
      );
    });

    it("should log error message with error object", () => {
      const error = new Error("Something went wrong");

      logger.error("Operation failed", error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]"),
        error,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Operation failed"),
        error,
      );
    });

    it("should include ISO timestamp in error log", () => {
      logger.error("Test error");

      const logCall = consoleErrorSpy.mock.calls[0][0];
      expect(logCall).toMatch(
        /\[ERROR\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - Test error/,
      );
    });
  });

  describe("warn", () => {
    it("should log warning message without metadata", () => {
      logger.warn("Test warning message");

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WARN]"),
        "",
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test warning message"),
        "",
      );
    });

    it("should log warning message with metadata", () => {
      const metadata = { threshold: 90, current: 95 };

      logger.warn("Threshold exceeded", metadata);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WARN]"),
        metadata,
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Threshold exceeded"),
        metadata,
      );
    });

    it("should include ISO timestamp in warning log", () => {
      logger.warn("Test warning");

      const logCall = consoleWarnSpy.mock.calls[0][0];
      expect(logCall).toMatch(
        /\[WARN\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - Test warning/,
      );
    });
  });

  describe("debug", () => {
    describe("non-production environment", () => {
      it("should log debug message without metadata", () => {
        logger.debug("Test debug message");

        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining("[DEBUG]"),
          "",
        );
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining("Test debug message"),
          "",
        );
      });

      it("should log debug message with metadata", () => {
        const metadata = { requestId: "abc-123", duration: 45 };

        logger.debug("Request processed", metadata);

        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining("[DEBUG]"),
          metadata,
        );
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining("Request processed"),
          metadata,
        );
      });

      it("should include ISO timestamp in debug log", () => {
        logger.debug("Test debug");

        const logCall = consoleDebugSpy.mock.calls[0][0];
        expect(logCall).toMatch(
          /\[DEBUG\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z - Test debug/,
        );
      });
    });

    describe("production environment", () => {
      beforeEach(() => {
        process.env.NODE_ENV = "production";
      });

      afterEach(() => {
        process.env.NODE_ENV = "test";
      });

      it("should not log debug message without metadata", () => {
        logger.debug("Test debug message");

        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining("[DEBUG]"),
          "",
        );
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining("Test debug message"),
          "",
        );
      });

      it("should not log debug message with metadata", () => {
        const metadata = { requestId: "abc-123", duration: 45 };

        logger.debug("Request processed", metadata);

        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining("[DEBUG]"),
          metadata,
        );
        expect(consoleDebugSpy).toHaveBeenCalledWith(
          expect.stringContaining("Request processed"),
          metadata,
        );
      });
    });
  });
});
