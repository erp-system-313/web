import { useState, useEffect, useCallback } from 'react';
import { hrService } from '../services/hrService';
import type { Employee, EmployeeFilters } from '../types/hr';

export const useEmployees = (filters?: EmployeeFilters) => {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hrService.employees.getAll(filters);
      setData(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.department, filters?.status]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { data, loading, error, total, refetch: fetchEmployees };
};
