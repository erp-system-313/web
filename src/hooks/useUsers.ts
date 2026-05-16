import { useState, useEffect, useCallback } from "react";
import { usersService } from "../services/usersService";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
} from "../services/usersService";

export const useUsers = (params?: {
  page?: number;
  size?: number;
  roleName?: string;
  isActive?: boolean;
}) => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersService.getAll(params);
      setData(response.content);
      setTotal(response.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.page, params?.size, params?.roleName, params?.isActive, refreshKey]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { data, loading, error, total, refetch };
};

export const useUser = (id: number | null) => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (id === null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await usersService.getById(id);
      setData(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { data, loading, error, refetch: fetchUser };
};

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateUserDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await usersService.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useUpdateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: number, data: UpdateUserDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await usersService.update(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
};

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await usersService.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { remove, loading, error };
};
