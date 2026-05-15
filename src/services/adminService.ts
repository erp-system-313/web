import { apiClient, handleApiError } from "../api/client";
import { endpoints } from "../api/endpoints";
import type { Role, Permission } from "../types/admin";

export const adminService = {
  roles: {
    getAll: async (): Promise<Role[]> => {
      try {
        const response = await apiClient.get(endpoints.roles.list);
        return response.data.data?.content ?? response.data.data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getById: async (id: number): Promise<Role> => {
      try {
        const response = await apiClient.get(endpoints.roles.getById(id));
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: { name: string; description?: string }): Promise<Role> => {
      try {
        const response = await apiClient.post(endpoints.roles.create, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (id: number, data: { name?: string; description?: string }): Promise<Role> => {
      try {
        const response = await apiClient.put(endpoints.roles.update(id), data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await apiClient.delete(endpoints.roles.delete(id));
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getPermissions: async (roleId: number): Promise<number[]> => {
      try {
        const response = await apiClient.get(endpoints.roles.permissions(roleId));
        return response.data.data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    assignPermissions: async (roleId: number, permissionIds: number[]): Promise<void> => {
      try {
        await apiClient.put(endpoints.roles.permissions(roleId), { permissionIds });
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  permissions: {
    getAll: async (): Promise<Permission[]> => {
      try {
        const response = await apiClient.get(endpoints.permissions.list);
        return response.data.data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },
};

export default adminService;
