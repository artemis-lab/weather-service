import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { coordinatesSchema } from "../../../src/validators/weather.validator";

describe("coordinatesSchema", () => {
  describe("valid inputs", () => {
    it("should parse valid coordinates", () => {
      const result = coordinatesSchema.parse({
        latitude: "39.7456",
        longitude: "-97.0892",
      });

      expect(result).toEqual({
        latitude: 39.7456,
        longitude: -97.0892,
      });
    });

    it("should trim whitespace", () => {
      const result = coordinatesSchema.parse({
        latitude: "  39.7456  ",
        longitude: "  -97.0892  ",
      });

      expect(result).toEqual({
        latitude: 39.7456,
        longitude: -97.0892,
      });
    });

    it("should accept boundary values", () => {
      const result = coordinatesSchema.parse({
        latitude: "90",
        longitude: "180",
      });

      expect(result).toEqual({
        latitude: 90,
        longitude: 180,
      });
    });

    it("should accept negative boundary values", () => {
      const result = coordinatesSchema.parse({
        latitude: "-90",
        longitude: "-180",
      });

      expect(result).toEqual({
        latitude: -90,
        longitude: -180,
      });
    });
  });

  describe("invalid inputs", () => {
    it("should reject empty latitude", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "",
          longitude: "-97.0892",
        }),
      ).toThrow(ZodError);
    });

    it("should reject empty longitude", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "39.7456",
          longitude: "",
        }),
      ).toThrow(ZodError);
    });

    it("should reject latitude out of range (too high)", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "91",
          longitude: "-97.0892",
        }),
      ).toThrow("Latitude must be between -90 and 90");
    });

    it("should reject latitude out of range (too low)", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "-91",
          longitude: "-97.0892",
        }),
      ).toThrow("Latitude must be between -90 and 90");
    });

    it("should reject longitude out of range (too high)", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "39.7456",
          longitude: "181",
        }),
      ).toThrow("Longitude must be between -180 and 180");
    });

    it("should reject longitude out of range (too low)", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "39.7456",
          longitude: "-181",
        }),
      ).toThrow("Longitude must be between -180 and 180");
    });

    it("should reject non-numeric latitude", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "abc",
          longitude: "-97.0892",
        }),
      ).toThrow(ZodError);
    });

    it("should reject non-numeric longitude", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "39.7456",
          longitude: "abc",
        }),
      ).toThrow(ZodError);
    });

    it("should reject whitespace-only latitude", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "   ",
          longitude: "-97.0892",
        }),
      ).toThrow("Latitude is required");
    });

    it("should reject whitespace-only longitude", () => {
      expect(() =>
        coordinatesSchema.parse({
          latitude: "39.7456",
          longitude: "   ",
        }),
      ).toThrow("Longitude is required");
    });
  });
});
