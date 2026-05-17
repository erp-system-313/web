import { apiClient as api, handleApiError } from "../api/client";

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
  error?: {
    message: string;
  };
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post("/v1/auth/login", credentials);
      const data = response.data;

      if (data.success && data.data) {
        return {
          success: true,
          data: {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            user: {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name || "User",
              role: data.data.user.role,
            },
          },
        };
      }

      return {
        success: false,
        error: {
          message: data.error?.message || "Login failed",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: handleApiError(error),
        },
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/v1/auth/logout");
    } catch (error) {
      // Ignore logout errors
    }
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    try {
      const response = await api.post("/v1/auth/refresh", { refreshToken });
      const data = response.data;

      if (data.success && data.data) {
        return {
          success: true,
          data: {
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            user: {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name || "User",
              role: data.data.user.role,
            },
          },
        };
      }

      return {
        success: false,
        error: {
          message: "Token refresh failed",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: handleApiError(error),
        },
      };
    }
  },

  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem("erp_user") || sessionStorage.getItem("erp_user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};
