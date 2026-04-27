import type { SignupResponse } from "../../../types/user/user.type";
import type { SignupFormData } from "../../../validator/user/signup.validator";
import api from "../config/axios";

export const userApi = {
  Register: async (data: SignupFormData): Promise<SignupResponse> => {
    const response = await api.post("/user/auth/signup", data);
    return response.data;
  },

  VerifyOtp: async (otp: string, email: string): Promise<SignupResponse> => {
    console.log(otp, email);
    const response = await api.post("/user/auth/VerifyOtp", { otp, email });
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await api.post("/user/auth/resend-otp", { email });
    return response.data;
  },

  Login: async (data: { email: string; password: string }) => {
    const response = await api.post("/user/auth/login", data);
    return response.data;
  },

  Logout: async () => {
    const response = await api.post("/user/auth/logout");
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/user/auth/verify-email", { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.put("/user/auth/reset-password", { token, password });
    return response.data;
  },

  googleLogin: async (
    idToken: string
  ): Promise<{ message: string; token: string; user: { id: string; name: string; email: string; role: string } }> => {
    const response = await api.post("/user/auth/google-login", { token: idToken });
    return response.data;
  },

  // POST /user/profile
  // Sends multipart/form-data with bio, userId, and up to 4 document files.
  // Backend saves files to disk via Multer and stores URL paths in MongoDB.
  UpdateProfile: async (data: FormData): Promise<{ message: string }> => {
    const response = await api.post("/user/profile", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  GetUserDetails: async (userId: string) => {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/user/auth/me");
    return response.data;
  },
};
