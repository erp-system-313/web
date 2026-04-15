import { useState, useEffect, useCallback } from "react";
import { financeService } from "../services/financeService";
import type { Invoice, InvoiceFilters } from "../types/finance";

export const useInvoices = (filters?: InvoiceFilters) => {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await financeService.invoices.getAll(filters);
      setData(response.items);
      setTotal(response.total);
    } catch {
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.customerId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { data, loading, error, total, refetch: fetchInvoices };
};
