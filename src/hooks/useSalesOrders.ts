import { useState, useEffect, useCallback } from "react";
import { salesService } from "../services/salesService";
import type { SalesOrder, SalesOrderFilters } from "../types/sales";

export const useSalesOrders = (filters?: SalesOrderFilters) => {
  const [data, setData] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.salesOrders.getAll(filters);
      setData(response.items);
      setTotal(response.total);
    } catch (err) {
      setError("Failed to fetch sales orders");
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.customerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { data, loading, error, total, refetch: fetchOrders };
};
