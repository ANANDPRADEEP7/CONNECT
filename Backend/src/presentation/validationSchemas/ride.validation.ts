import { z } from "zod";
import { ValidationResult } from "./auth.validation";

/** Reusable Zod schema for a Coordinate object */
const coordinateSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  latitude: z.number({ message: "Latitude must be a number" }),
  longitude: z.number({ message: "Longitude must be a number" }),
});

export const createRideSchema = z.object({
  from: coordinateSchema,
  to: coordinateSchema,
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  seats: z
    .union([z.string(), z.number()])
    .transform(Number)
    .refine((val) => val > 0, "Seats must be greater than 0"),
  pricePerSeat: z
    .union([z.string(), z.number()])
    .transform(Number)
    .refine((val) => val > 0, "Price must be greater than 0"),
  description: z.string().optional(),
  vehicleId: z.string().optional(),
  stopovers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        coords: coordinateSchema,
      }),
    )
    .optional(),
  distance: z.string().optional(),
  duration: z.string().optional(),
});

export function validateCreateRideBody(body: unknown): ValidationResult {
  const result = createRideSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err) => err.message).join(", "),
    };
  }
  return { valid: true };
}
