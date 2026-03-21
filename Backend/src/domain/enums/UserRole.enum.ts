/**
 * UserRole Enum – Domain Layer
 * Centralised definition of user roles used across the entire application.
 * Keeps role values in one place so they never get out of sync.
 */
export enum UserRole {
  USER  = "user",
  RIDER = "rider",
  ADMIN = "admin",
}

/**
 * RiderStatus Enum – Domain Layer
 * Lifecycle states for a rider's verification/approval.
 */
export enum RiderStatus {
  NONE     = "none",
  PENDING  = "pending",
  ACTIVE   = "active",
  DECLINED = "declined",
}
