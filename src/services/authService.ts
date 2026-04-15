export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock users for testing
const mockUsers: Array<{ email: string; password: string; user: AuthUser }> = [
  {
    email: 'admin@company.com',
    password: 'admin123',
    user: { id: 1, email: 'admin@company.com', name: 'Admin User', role: 'ADMIN' },
  },
  {
    email: 'manager@company.com',
    password: 'manager123',
    user: { id: 2, email: 'manager@company.com', name: 'Manager User', role: 'MANAGER' },
  },
  {
    email: 'staff@company.com',
    password: 'staff123',
    user: { id: 3, email: 'staff@company.com', name: 'Staff User', role: 'STAFF' },
  },
];

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    await delay(500);

    const user = mockUsers.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (user) {
      return {
        success: true,
        data: {
          accessToken: `mock-jwt-token-${Date.now()}`,
          refreshToken: `mock-refresh-token-${Date.now()}`,
          user: user.user,
        },
      };
    }

    return {
      success: false,
      error: {
        message: 'Invalid email or password',
      },
    };
  },

  logout: async (): Promise<void> => {
    await delay(200);
    return;
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    await delay(300);
    return {
      success: true,
      data: {
        accessToken: `mock-jwt-token-${Date.now()}`,
        refreshToken: refreshToken,
        user: { id: 1, email: 'admin@company.com', name: 'Admin User', role: 'ADMIN' },
      },
    };
  },

  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem('erp_user');
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
