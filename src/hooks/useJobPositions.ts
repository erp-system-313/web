import { useState, useEffect, useCallback } from 'react';
import { hrService } from '../services/hrService';
import type { JobPosition } from '../types/hr';

export const useJobPositions = () => {
  const [data, setData] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await hrService.jobPositions.getAll();
      setData(result);
    } catch (err) {
      setError('Failed to fetch job positions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export const useCreateJobPosition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: Partial<JobPosition>) => {
    setLoading(true);
    setError(null);
    try {
      return await hrService.jobPositions.create(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job position');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useUpdateJobPosition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: number, data: Partial<JobPosition>) => {
    setLoading(true);
    setError(null);
    try {
      return await hrService.jobPositions.update(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job position');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
};

export const useDeleteJobPosition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePos = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await hrService.jobPositions.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job position');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { delete: deletePos, loading, error };
};
