import { z } from "zod";
import { ValidationResult } from "./auth.validation";

export const updateRiderStatusSchema = z.object({
  status: z.enum(["active", "declined"], {
    message: "Status must be either 'active' or 'declined'",
  }),
});

export function validateUpdateRiderStatusBody(body: unknown): ValidationResult {
  const result = updateRiderStatusSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err) => err.message).join(", "),
    };
  }
  return { valid: true };
}
