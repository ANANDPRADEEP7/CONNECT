import type { SignupResponse } from "../../../types/user/user.type";
import type { SignupFormData } from "../../../validator/user/signup.validator";
import api from "../config/axios";
import { USER_API_ROUTES } from "../constants/apiRoutes.constants";

export const userApi = {
  Register: async (data: SignupFormData): Promise<SignupResponse> => {
    const response = await api.post(USER_API_ROUTES.SIGNUP, data);
    return response.data;
  },

  VerifyOtp: async (otp: string, email: string): Promise<SignupResponse> => {
    console.log(otp, email);
    const response = await api.post(USER_API_ROUTES.VERIFY_OTP, { otp, email });
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await api.post(USER_API_ROUTES.RESEND_OTP, { email });
    return response.data;
  },

  Login: async (data: { email: string; password: string }) => {
    const response = await api.post(USER_API_ROUTES.LOGIN, data);
    return response.data;
  },

  Logout: async () => {
    const response = await api.post(USER_API_ROUTES.LOGOUT);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post(USER_API_ROUTES.VERIFY_EMAIL, { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.put(USER_API_ROUTES.RESET_PASSWORD, { token, password });
    return response.data;
  },

  googleLogin: async (
    idToken: string
  ): Promise<{ message: string; token: string; user: { id: string; name: string; email: string; role: string } }> => {
    const response = await api.post(USER_API_ROUTES.GOOGLE_LOGIN, { token: idToken });
    return response.data;
  },

  // POST /user/profile
  // Sends JSON body with bio, userId, and Cloudinary secure_url strings.
  // Files are uploaded directly to Cloudinary on the frontend before calling this.
  UpdateProfile: async (data: {
    userId: string;
    bio: string;
    govId?: string;
    vehicleImage?: string;
    pucImage?: string;
    rcImage?: string;
  }): Promise<{ message: string }> => {
    const response = await api.post(USER_API_ROUTES.UPDATE_PROFILE, data);
    return response.data;
  },

  GetUserDetails: async (userId: string) => {
    const response = await api.get(USER_API_ROUTES.GET_USER(userId));
    return response.data;
  },

  getMe: async () => {
    const response = await api.get(USER_API_ROUTES.ME);
    return response.data;
  },
};
