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

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
    if (error.response?.status === 401) {
      localStorage.removeItem("erp_token");
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
