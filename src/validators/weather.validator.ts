import { z } from "zod";

export const coordinatesSchema = z.object({
  latitude: z
    .string()
    .trim()
    .min(1, "Latitude is required")
    .refine((v: string) => !isNaN(Number(v)), "Latitude must be a valid number")
    .transform((v: string) => Number(v))
    .pipe(
      z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
    ),
  longitude: z
    .string()
    .trim()
    .min(1, "Longitude is required")
    .refine(
      (v: string) => !isNaN(Number(v)),
      "Longitude must be a valid number",
    )
    .transform((v: string) => Number(v))
    .pipe(
      z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
    ),
});
