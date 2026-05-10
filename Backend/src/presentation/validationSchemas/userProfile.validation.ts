import { z } from "zod";
import { ValidationResult } from "./auth.validation";

export const updateProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  bio: z.string().optional(),
  govId: z.string().optional(),
  vehicleImage: z.string().optional(),
  pucImage: z.string().optional(),
  rcImage: z.string().optional(),
});

export function validateUpdateProfileBody(body: unknown): ValidationResult {
  const result = updateProfileSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err: z.ZodIssue) => err.message).join(", "),
    };
  }
  return { valid: true };
}
