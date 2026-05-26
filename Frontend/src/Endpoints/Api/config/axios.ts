import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(undefined)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    const resBody = response.data;
    if (resBody && typeof resBody === "object" && "statusCode" in resBody && "message" in resBody) {
      const { statusCode, message, data, error } = resBody;

      if (data && typeof data === "object") {
        if (Array.isArray(data)) {
          const merged = [...data] as unknown[] & {
            statusCode: number;
            message: string;
            error?: unknown;
          };
          merged.statusCode = statusCode;
          merged.message = message;
          merged.error = error;
          response.data = merged;
        } else {
          response.data = {
            ...data,
            statusCode,
            message,
            error,
          };
        }
      } else {
        response.data = {
          data,
          statusCode,
          message,
          error,
        };
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/user/auth/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
