
const USER_BASE = "/user";
const AUTH_BASE = `${USER_BASE}/auth`;

const ADMIN_BASE = "/admin";

const RIDE_BASE = "/ride";

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
  UPDATE_PERSONAL_INFO: `${USER_BASE}/personal-info`,
  GET_USER: (userId: string) => `${USER_BASE}/${userId}`,
} as const;

export const ADMIN_API_ROUTES = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  LOGIN: `${ADMIN_BASE}/login`,
  LOGOUT: `${ADMIN_BASE}/logout`,
  ME: `${ADMIN_BASE}/me`,

  // ── Users ─────────────────────────────────────────────────────────────────
  GET_USERS: `${ADMIN_BASE}/users`,
  TOGGLE_BLOCK_USER: (id: string) => `${ADMIN_BASE}/users/${id}/block`,

  // ── Riders ────────────────────────────────────────────────────────────────
  GET_RIDERS: `${ADMIN_BASE}/riders`,
  UPDATE_RIDER_STATUS: (id: string) => `${ADMIN_BASE}/riders/${id}/status`,

  // ── Rides ─────────────────────────────────────────────────────────────────
  GET_RIDES: `${ADMIN_BASE}/rides`,
  UPDATE_RIDE_STATUS: (id: string) => `${ADMIN_BASE}/rides/${id}/status`,
  DELETE_RIDE: (id: string) => `${ADMIN_BASE}/rides/${id}`,
} as const;

export const RIDE_API_ROUTES = {
  CREATE_RIDE: RIDE_BASE,
  GET_RIDES: RIDE_BASE,
  SEARCH_RIDES: `${RIDE_BASE}/search`,
  GET_MY_RIDES: `${RIDE_BASE}/my`,
  GET_RIDE_BY_ID: (id: string) => `${RIDE_BASE}/${id}`,
  UPDATE_RIDE: (id: string) => `${RIDE_BASE}/${id}`,
  CANCEL_RIDE: (id: string) => `${RIDE_BASE}/${id}/cancel`,
  DELETE_RIDE: (id: string) => `${RIDE_BASE}/${id}`,
} as const;

const VEHICLE_BASE = "/vehicle";

export const VEHICLE_API_ROUTES = {
  CREATE: VEHICLE_BASE,
  GET_MY: `${VEHICLE_BASE}/my`,
  GET_BY_ID: (id: string) => `${VEHICLE_BASE}/${id}`,
  UPDATE: (id: string) => `${VEHICLE_BASE}/${id}`,
  DELETE: (id: string) => `${VEHICLE_BASE}/${id}`,
} as const;
