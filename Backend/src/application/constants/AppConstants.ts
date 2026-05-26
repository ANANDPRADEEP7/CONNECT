export const AppConstants = {
  errors: {
    // Auth
    USER_NOT_FOUND: "User not found",
    USER_ALREADY_EXISTS: "User with this email already exists",
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_BLOCKED: "Your account has been blocked. Please contact support.",
    EMAIL_NOT_VERIFIED: "Please verify your email before logging in.",
    INVALID_OTP: "Invalid or expired OTP",
    INVALID_TOKEN: "Invalid or expired token",
    TOKEN_REQUIRED: "Token is required",
    // Google
    GOOGLE_TOKEN_REQUIRED: "Google ID token is required",
    // Password
    PASSWORD_RESET_SUCCESS: "Password reset successfully.",
    PASSWORD_LINK_SENT: "Password reset link sent to your email.",
    // Admin
    NOT_AN_ADMIN: "Access denied: Admins only",
    // Upload
    INVALID_FILE_TYPE: "Only images (jpeg, jpg, png) and PDF files are allowed",
  },
  success: {
    REGISTER_SUCCESS: "Registration successful. Please verify your email.",
    LOGIN_SUCCESS: "Login successful",
    OTP_SENT: "OTP sent successfully",
    OTP_VERIFIED: "OTP verified successfully",
    LOGOUT_SUCCESS: "Logged out successfully",
    PROFILE_UPDATED: "Profile updated successfully",
  },
};
