/**
 * Auth Validation Schemas – Presentation Layer
 * Lightweight validation helpers for auth route request bodies.
 * Uses plain TypeScript; swap for Zod/Joi later if needed.
 */

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/** Validate registration body */
export function validateRegisterBody(body: any): ValidationResult {
  const { name, email, password } = body;
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return { valid: false, message: "Name must be at least 2 characters." };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: "A valid email is required." };
  }
  if (!password || password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters." };
  }
  return { valid: true };
}

/** Validate login body */
export function validateLoginBody(body: any): ValidationResult {
  const { email, password } = body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: "A valid email is required." };
  }
  if (!password) {
    return { valid: false, message: "Password is required." };
  }
  return { valid: true };
}

/** Validate OTP body */
export function validateOtpBody(body: any): ValidationResult {
  const { email, otp } = body;
  if (!email) return { valid: false, message: "Email is required." };
  if (!otp || String(otp).length !== 6) {
    return { valid: false, message: "OTP must be 6 digits." };
  }
  return { valid: true };
}
