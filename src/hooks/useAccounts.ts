import { useState, useEffect, useCallback } from "react";
import { financeService } from "../services/financeService";
import type { Account } from "../types/finance";

export const useAccounts = () => {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accounts = await financeService.accounts.getAll();
      setData(accounts);
    } catch {
      setError("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return { data, loading, error, refetch: fetchAccounts };
};
