import { useState, useEffect, useCallback } from 'react';
import { hrService } from '../services/hrService';
import type { Employee } from '../types/hr';

export const useEmployee = (id: number | null) => {
  const [data, setData] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployee = useCallback(async () => {
    if (id === null) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const employee = await hrService.employees.getById(id);
      setData(employee);
    } catch (err) {
      setError('Failed to fetch employee');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  return { data, loading, error, refetch: fetchEmployee };
};
