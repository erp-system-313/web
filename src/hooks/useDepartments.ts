import { useState, useEffect, useCallback } from 'react';
import { hrService } from '../services/hrService';
import type { Department } from '../types/hr';

export const useDepartments = () => {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await hrService.departments.getAll();
      setData(result);
    } catch (err) {
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export const useCreateDepartment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: Partial<Department>) => {
    setLoading(true);
    setError(null);
    try {
      return await hrService.departments.create(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create department');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useUpdateDepartment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: number, data: Partial<Department>) => {
    setLoading(true);
    setError(null);
    try {
      return await hrService.departments.update(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update department');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
};

export const useDeleteDepartment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDept = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await hrService.departments.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { delete: deleteDept, loading, error };
};
