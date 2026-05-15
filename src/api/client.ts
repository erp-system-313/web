import axios, { AxiosError } from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = "/api";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';
    if (url.includes('/auth/')) {
      return config;
    }
    const token =
      localStorage.getItem("erp_token") || localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("erp_refresh_token");

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem("erp_token");
        localStorage.removeItem("erp_refresh_token");
        localStorage.removeItem("erp_user");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post("/api/v1/auth/refresh", {
          refreshToken,
        });
        const data = response.data;

        if (data.success && data.data) {
          const newToken = data.data.accessToken;
          localStorage.setItem("erp_token", newToken);
          localStorage.setItem(
            "erp_refresh_token",
            data.data.refreshToken || refreshToken,
          );
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // refresh failed
      }

      processQueue(error, null);
      isRefreshing = false;
      localStorage.removeItem("erp_token");
      localStorage.removeItem("erp_refresh_token");
      localStorage.removeItem("erp_user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: Array<{ field: string; message: string }>;

  constructor(
    status: number,
    code: string,
    msg: string,
    fieldErrors?: Array<{ field: string; message: string }>,
  ) {
    super(msg);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data;
    if (apiError?.error?.message) {
      return apiError.error.message;
    }
    if (error.response?.status === 401) {
      return "Unauthorized. Please login again.";
    }
    if (error.response?.status === 403) {
      return "You do not have permission to perform this action.";
    }
    if (error.response?.status === 404) {
      return "Resource not found.";
    }
    if (error.response?.status === 500) {
      return "Server error. Please try again later.";
    }
    return error.message || "An error occurred";
  }
  return "An unexpected error occurred";
};

export default apiClient;
