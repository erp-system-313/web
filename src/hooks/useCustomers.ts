import { useState, useEffect, useCallback } from "react";
import { salesService } from "../services/salesService";
import type { Customer, CustomerFilters } from "../types/sales";

export const useCustomers = (filters?: CustomerFilters) => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.customers.getAll(filters);
      setData(response.items);
      setTotal(response.total);
    } catch (err) {
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.isActive]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { data, loading, error, total, refetch: fetchCustomers };
};
