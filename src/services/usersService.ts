import api, { handleApiError } from './apiClient';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'ADMIN' | 'MANAGER' | 'STAFF' | 'GUEST';
  password?: string;
}

export interface UsersResponse {
  content: User[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const usersService = {
  getAll: async (params?: { page?: number; size?: number; search?: string }): Promise<UsersResponse> => {
    try {
      const response = await api.get('/users', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getById: async (id: number): Promise<User> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  create: async (data: CreateUserDto): Promise<User> => {
    try {
      const response = await api.post('/users', data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default usersService;