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



export const updatePersonalInfoSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters")
    .optional(),
  email: z.string().email("A valid email is required").optional(),
  phonenumber: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Phone number must be 7-15 digits, optionally starting with +")
    .optional(),
});

export function validateUpdatePersonalInfoBody(body: unknown): ValidationResult {
  const result = updatePersonalInfoSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err: z.ZodIssue) => err.message).join(", "),
    };
  }

  const parsed = body as Record<string, unknown>;
  if (!parsed.name && !parsed.email && !parsed.phonenumber) {
    return { valid: false, message: "At least one field (name, email, or phone) is required." };
  }
  return { valid: true };
}
