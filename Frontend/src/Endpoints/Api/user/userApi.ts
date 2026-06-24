import type { SignupFormData } from "../../../validator/user/signup.validator";
import type { ApiResponse } from "../../../types/common/api.types";
import type { AuthUser } from "../../../store/slices/authSlice";
import api from "../config/axios";
import { USER_API_ROUTES } from "../constants/apiRoutes.constants";

export const userApi = {
  register: async (data: SignupFormData): Promise<ApiResponse> => {
    const response = await api.post(USER_API_ROUTES.SIGNUP, data);
    return response.data;
  },
 
  verifyOtp: async (otp: string, email: string): Promise<ApiResponse> => {
    console.log(otp, email);
    const response = await api.post(USER_API_ROUTES.VERIFY_OTP, { otp, email });
    return response.data;
  },

  resendOtp: async (email: string): Promise<ApiResponse> => {
    const response = await api.post(USER_API_ROUTES.RESEND_OTP, { email });
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<ApiResponse<{ user: AuthUser; token: string }>> => {
    const response = await api.post(USER_API_ROUTES.LOGIN, data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post(USER_API_ROUTES.LOGOUT);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await api.post(USER_API_ROUTES.VERIFY_EMAIL, { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse> => {
    const response = await api.put(USER_API_ROUTES.RESET_PASSWORD, { token, password });
    return response.data;
  },

  googleLogin: async (
    idToken: string
  ): Promise<ApiResponse<{ token: string; user: AuthUser }>> => {
    const response = await api.post(USER_API_ROUTES.GOOGLE_LOGIN, { token: idToken });
    return response.data;
  },

  
  updateProfile: async (data: {
    userId: string;
    bio: string;
    govId?: string;
    vehicleImage?: string;
    pucImage?: string;
    rcImage?: string;
  }): Promise<ApiResponse> => {
    const response = await api.post(USER_API_ROUTES.UPDATE_PROFILE, data);
    return response.data;
  },

  updatePersonalInfo: async (data: {
    name?: string;
    email?: string;
    phonenumber?: string;
  }): Promise<ApiResponse<{ name?: string; email?: string; phonenumber?: string }>> => {
    const response = await api.patch(USER_API_ROUTES.UPDATE_PERSONAL_INFO, data);
    return response.data;
  },

  getUserDetails: async (userId: string): Promise<ApiResponse<{ user: AuthUser }>> => {
    const response = await api.get(USER_API_ROUTES.GET_USER(userId));
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<{ user: AuthUser }>> => {
    const response = await api.get(USER_API_ROUTES.ME);
    return response.data;
  },
};
