import api from "../config/axios";
import type { LoginFormData } from "../../../validator/user/login.validator";

export const adminApi = {
  Login: async (data: LoginFormData) => {
    const response = await api.post("/admin/login", data);
    return response.data;
  },
  Logout: async () => {
    const response = await api.post("/admin/logout");
    return response.data;
  },
  getUsers: async (page: number = 1, limit: number = 10, search?: string, filter?: string) => {
    const response = await api.get("/admin/users", { params: { page, limit, search, filter } });
    return response.data;
  },
  toggleBlockUser: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/block`);
    return response.data;
  },
  getRiders: async (page: number = 1, limit: number = 10, search?: string, filter?: string) => {
    const response = await api.get("/admin/riders", { params: { page, limit, search, filter } });
    return response.data;
  },
  updateRiderStatus: async (id: string, status: "active" | "declined", rejectionReason?: string) => {
    const response = await api.patch(`/admin/riders/${id}/status`, { status, rejectionReason });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/admin/me");
    return response.data;
  },
};
