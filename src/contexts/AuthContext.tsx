import { createContext, useState, useEffect, useCallback } from "react";
import type { AuthUser, LoginRequest } from "../services/authService";
import { authService } from "../services/authService";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginRequest,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);

    if (response.success && response.data) {
      const { user, accessToken, refreshToken } = response.data;
      setUser(user);
      const store = credentials.remember ? localStorage : sessionStorage;
      store.setItem("erp_token", accessToken);
      store.setItem("erp_refresh_token", refreshToken);
      store.setItem("erp_user", JSON.stringify(user));
      return { success: true };
    }

    return {
      success: false,
      error: response.error?.message || "Login failed",
    };
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_refresh_token");
    localStorage.removeItem("erp_user");
    sessionStorage.removeItem("erp_token");
    sessionStorage.removeItem("erp_refresh_token");
    sessionStorage.removeItem("erp_user");
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
