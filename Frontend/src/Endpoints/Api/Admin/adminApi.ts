import type { LoginFormData } from "../../../validator/user/login.validator";
import type { ApiResponse } from "../../../types/common/api.types";
import type { AuthUser } from "../../../store/slices/authSlice";
import type { AdminUserItem, AdminRiderItem, AdminRideItem, AdminRidesStats } from "../../../types/admin/admin.types";
import api from "../config/axios";
import { ADMIN_API_ROUTES } from "../constants/apiRoutes.constants";

export const adminApi = {
  login: async (data: LoginFormData): Promise<ApiResponse<{ admin: AuthUser; token: string }>> => {
    const response = await api.post(ADMIN_API_ROUTES.LOGIN, data);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post(ADMIN_API_ROUTES.LOGOUT);
    return response.data;
  },

  getUsers: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    filter?: string
  ): Promise<ApiResponse<{ data: AdminUserItem[]; totalPages: number }>> => {
    const response = await api.get(ADMIN_API_ROUTES.GET_USERS, { params: { page, limit, search, filter } });
    return response.data;
  },

  toggleBlockUser: async (id: string): Promise<ApiResponse<{ isBlocked: boolean }>> => {
    const response = await api.patch(ADMIN_API_ROUTES.TOGGLE_BLOCK_USER(id));
    return response.data;
  },

  getRiders: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    filter?: string
  ): Promise<ApiResponse<{ data: AdminRiderItem[]; totalPages: number }>> => {
    const response = await api.get(ADMIN_API_ROUTES.GET_RIDERS, { params: { page, limit, search, filter } });
    return response.data;
  },

  updateRiderStatus: async (
    id: string,
    status: "active" | "declined",
    rejectionReason?: string
  ): Promise<ApiResponse> => {
    const response = await api.patch(ADMIN_API_ROUTES.UPDATE_RIDER_STATUS(id), { status, rejectionReason });
    return response.data;
  },

  getRides: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    filter?: string
  ): Promise<ApiResponse<{ data: AdminRideItem[]; totalPages: number; stats: AdminRidesStats }>> => {
    const response = await api.get(ADMIN_API_ROUTES.GET_RIDES, { params: { page, limit, search, filter } });
    return response.data;
  },

  updateRideStatus: async (
    id: string,
    status: "active" | "completed" | "cancelled" | "suspended",
    reason?: string
  ): Promise<ApiResponse> => {
    const response = await api.patch(ADMIN_API_ROUTES.UPDATE_RIDE_STATUS(id), { status, reason });
    return response.data;
  },



  getMe: async (): Promise<ApiResponse<{ admin: AuthUser }>> => {
    const response = await api.get(ADMIN_API_ROUTES.ME);
    return response.data;
  },
};
