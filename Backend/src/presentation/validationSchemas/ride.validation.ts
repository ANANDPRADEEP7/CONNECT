import { z } from "zod";
import { ValidationResult } from "./auth.validation";

export const createRideSchema = z.object({
  from: z.string().min(1, "Pickup location is required"),
  to: z.string().min(1, "Drop-off location is required"),
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
