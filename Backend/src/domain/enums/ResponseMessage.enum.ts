export enum ResponseMessage {
  // Auth
  LOGIN_SUCCESS = "Login successful",
  LOGOUT_SUCCESS = "Logged out successfully",
  USER_NOT_FOUND = "User not found. Please sign up first.",
  USER_BLOCKED = "Your account has been blocked. Contact support.",
  INCORRECT_PASSWORD = "Incorrect password. Please try again.",
  AUTH_REQUIRED = "Authentication required",
  NOT_AUTHORIZED = "Not authorized to access this resource",
  REGISTRATION_SUCCESS = "Registration successful",
  OTP_VERIFIED = "OTP verified successfully",
  OTP_INVALID = "Invalid OTP. Please try again.",
  PASSWORD_RESET_LINK_SENT = "Password reset link sent to your email.",
  PASSWORD_RESET_SUCCESS = "Password reset successfully.",

  // Profile
  PROFILE_UPDATE_SUCCESS = "Profile updated successfully.",
  PROFILE_PENDING_REVIEW = "Profile updated successfully. Status set to pending review.",

  // Admin
  RIDER_APPROVED = "Rider approved successfully",
  RIDER_REJECTED = "Rider rejected successfully",
  RIDER_NOT_FOUND = "Rider not found",
  ADMIN_LOGIN_SUCCESS = "Admin login successful",

  // General
  INTERNAL_SERVER_ERROR = "Internal Server Error",
  ROUTE_NOT_FOUND = "Route not found",
}
