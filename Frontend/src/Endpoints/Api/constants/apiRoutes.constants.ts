/**
 * Centralised API route constants for the frontend.
 * All axios call paths are defined here so a single change propagates everywhere.
 */

const USER_BASE = "/user";
const AUTH_BASE = `${USER_BASE}/auth`;

export const USER_API_ROUTES = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  SIGNUP: `${AUTH_BASE}/signup`,
  VERIFY_OTP: `${AUTH_BASE}/VerifyOtp`,
  RESEND_OTP: `${AUTH_BASE}/resend-otp`,
  LOGIN: `${AUTH_BASE}/login`,
  LOGOUT: `${AUTH_BASE}/logout`,
  VERIFY_EMAIL: `${AUTH_BASE}/verify-email`,
  RESET_PASSWORD: `${AUTH_BASE}/reset-password`,
  GOOGLE_LOGIN: `${AUTH_BASE}/google-login`,
  ME: `${AUTH_BASE}/me`,

  // ── User ──────────────────────────────────────────────────────────────────
  UPDATE_PROFILE: `${USER_BASE}/profile`,
  GET_USER: (userId: string) => `${USER_BASE}/${userId}`,
} as const;
