// ─── Auth ────────────────────────────────────────────────────────────────────
export const AUTH_ROUTES = {
  SIGNUP: "/signup",
  VERIFY_OTP: "/VerifyOtp",
  RESEND_OTP: "/resend-otp",
  LOGIN: "/login",
  REFRESH: "/refresh",
  VERIFY_EMAIL: "/verify-email",
  RESET_PASSWORD: "/reset-password",
  GOOGLE_LOGIN: "/google-login",
  LOGOUT: "/logout",
  ME: "/me",
} as const;

// ─── Admin ───────────────────────────────────────────────────────────────────
export const ADMIN_ROUTES = {
  LOGIN: "/login",
  LOGOUT: "/logout",
  ME: "/me",
  USERS: "/users",
  RIDERS: "/riders",
  TOGGLE_BLOCK_USER: "/users/:id/block",
  UPDATE_RIDER_STATUS: "/riders/:id/status",
} as const;

// ─── Ride ────────────────────────────────────────────────────────────────────
export const RIDE_ROUTES = {
  ROOT: "/",
  MY_RIDES: "/my",
} as const;
