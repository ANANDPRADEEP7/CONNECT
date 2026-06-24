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
  GET_RIDES: "/rides",
  UPDATE_RIDE_STATUS: "/rides/:id/status",
  DELETE_RIDE: "/rides/:id",
} as const;

// ─── Ride ────────────────────────────────────────────────────────────────────
export const RIDE_ROUTES = {
  ROOT: "/",
  SEARCH: "/search",
  MY_RIDES: "/my",
  BY_ID: "/:id",
  CANCEL: "/:id/cancel",
} as const;
