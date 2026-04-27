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
  getUsers: async () => {
    const response = await api.get("/admin/users");
    return response.data;
  },
  toggleBlockUser: async (id: string) => {
    const response = await api.patch(`/admin/users/${id}/block`);
    return response.data;
  },
  getRiders: async () => {
    const response = await api.get("/admin/riders");
    return response.data;
  },
  updateRiderStatus: async (id: string, status: "active" | "declined") => {
    const response = await api.patch(`/admin/riders/${id}/status`, { status });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/admin/me");
    return response.data;
  },
};
