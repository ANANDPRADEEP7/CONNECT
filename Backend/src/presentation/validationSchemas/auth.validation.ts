import { z } from "zod";

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const registerSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("A valid email is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password must be under 64 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
  phone: z.string().optional(),
});

export function validateRegisterBody(body: unknown): ValidationResult {
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err) => err.message).join(", "),
    };
  }
  return { valid: true };
}

const loginSchema = z.object({
  email: z.string().email("A valid email is required."),
  password: z.string().min(1, "Password is required."),
});

export function validateLoginBody(body: unknown): ValidationResult {
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err) => err.message).join(", "),
    };
  }
  return { valid: true };
}

const otpSchema = z.object({
  email: z.string().email("Email is required."),
  otp: z
    .string()
    .length(5, "OTP must be 6 digits.")
    .or(z.number().transform(String).pipe(z.string().length(6, "OTP must be 6 digits."))),
});

export function validateOtpBody(body: unknown): ValidationResult {
  const result = otpSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err) => err.message).join(", "),
    };
  }
  return { valid: true };
}

const verifyEmailSchema = z.object({
  email: z.string().email("A valid email is required."),
});

export function validateVerifyEmailBody(body: unknown): ValidationResult {
  const result = verifyEmailSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err) => err.message).join(", "),
    };
  }
  return { valid: true };
}

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password must be under 64 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number.")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character."),
});

export function validateResetPasswordBody(body: unknown): ValidationResult {
  const result = resetPasswordSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err) => err.message).join(", "),
    };
  }
  return { valid: true };
}

const googleLoginSchema = z.object({
  token: z.string().min(1, "Google ID token is required."),
});

export function validateGoogleLoginBody(body: unknown): ValidationResult {
  const result = googleLoginSchema.safeParse(body);
  if (!result.success) {
    return {
      valid: false,
      message: result.error.issues.map((err) => err.message).join(", "),
    };
  }
  return { valid: true };
}
