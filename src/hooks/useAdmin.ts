import { useState, useEffect, useCallback } from "react";
import { adminService } from "../services/adminService";
import type { Role, Permission } from "../types/admin";

export const useRoles = () => {
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.roles.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { data, loading, error, refetch: fetchRoles };
};

export const useCreateRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: { name: string; description?: string }) => {
    setLoading(true);
    setError(null);
    try {
      return await adminService.roles.create(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useUpdateRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: number, data: { name?: string; description?: string }) => {
    setLoading(true);
    setError(null);
    try {
      return await adminService.roles.update(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
};

export const useDeleteRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await adminService.roles.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { remove, loading, error };
};

export const usePermissions = () => {
  const [data, setData] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.permissions.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return { data, loading, error, refetch: fetchPermissions };
};

export const useRolePermissions = (roleId: number | null) => {
  const [data, setData] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (roleId === null) return;
    setLoading(true);
    try {
      const result = await adminService.roles.getPermissions(roleId);
      setData(result);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const assign = useCallback(async (permissionIds: number[]) => {
    if (roleId === null) return;
    setLoading(true);
    try {
      await adminService.roles.assignPermissions(roleId, permissionIds);
      setData(permissionIds);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  return { data, loading, refetch: fetch, assign };
};
