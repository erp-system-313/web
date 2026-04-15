import { useState, useEffect, useCallback } from "react";
import { financeService } from "../services/financeService";
import type { JournalEntry, JournalFilters } from "../types/finance";

export const useJournalEntries = (filters?: JournalFilters) => {
  const [data, setData] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await financeService.journalEntries.getAll(filters);
      setData(response.items);
      setTotal(response.total);
    } catch {
      setError("Failed to fetch journal entries");
    } finally {
      setLoading(false);
    }
  }, [filters?.search, filters?.status, filters?.journalType]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { data, loading, error, total, refetch: fetchEntries };
};
