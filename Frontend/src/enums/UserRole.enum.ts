/**
 * Frontend mirror of the backend UserRole / RiderStatus enums.
 * Values must stay in sync with Backend/src/domain/enums/UserRole.enum.ts.
 */

export const UserRole = {
  USER: "user",
  RIDER: "rider",
  ADMIN: "admin",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const RiderStatus = {
  NONE: "none",
  PENDING: "pending",
  ACTIVE: "active",
  DECLINED: "declined",
} as const;

export type RiderStatus = typeof RiderStatus[keyof typeof RiderStatus];
