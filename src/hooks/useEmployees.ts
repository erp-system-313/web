import { useState, useEffect, useCallback } from 'react';
import { hrService, type Employee, type CreateEmployeeRequest, type UpdateEmployeeRequest } from '../services/hrService';

interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
}

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
      setData(response.content);
      setTotal(response.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.department, filters?.status]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = useCallback(async (employee: CreateEmployeeRequest) => {
    const newEmployee = await hrService.employees.create(employee);
    await fetchEmployees();
    return newEmployee;
  }, [fetchEmployees]);

  const updateEmployee = useCallback(async (id: number, employee: UpdateEmployeeRequest) => {
    const updated = await hrService.employees.update(id, employee);
    await fetchEmployees();
    return updated;
  }, [fetchEmployees]);

  const deleteEmployee = useCallback(async (id: number) => {
    await hrService.employees.delete(id);
    await fetchEmployees();
  }, [fetchEmployees]);

  return { 
    data, 
    loading, 
    error, 
    total, 
    refetch: fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
  };
};