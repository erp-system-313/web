import { useState, useEffect, useCallback } from "react";
import { financeService } from "../services/financeService";
import type { JournalEntry, CreateJournalEntryDto } from "../types/finance";

export const useJournalEntry = (id?: number) => {
  const [data, setData] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchEntry = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const entry = await financeService.journalEntries.getById(id);
      setData(entry);
    } catch {
      setError("Failed to fetch journal entry");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const create = async (
    data: CreateJournalEntryDto,
  ): Promise<JournalEntry | null> => {
    setSaving(true);
    try {
      const newEntry = await financeService.journalEntries.create(data);
      return newEntry;
    } catch {
      setError("Failed to create journal entry");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const update = async (
    updates: Partial<CreateJournalEntryDto>,
  ): Promise<JournalEntry | null> => {
    if (!id) return null;
    setSaving(true);
    try {
      const updated = await financeService.journalEntries.update(id, updates);
      setData(updated);
      return updated;
    } catch {
      setError("Failed to update journal entry");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const post = async (): Promise<JournalEntry | null> => {
    if (!id) return null;
    setSaving(true);
    try {
      const posted = await financeService.journalEntries.post(id);
      setData(posted);
      return posted;
    } catch {
      setError("Failed to post journal entry");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const reverse = async (): Promise<JournalEntry | null> => {
    if (!id) return null;
    setSaving(true);
    try {
      const reversed = await financeService.journalEntries.reverse(id);
      return reversed;
    } catch {
      setError("Failed to reverse journal entry");
      return null;
    } finally {
      setSaving(false);
    }
  };

  return {
    data,
    loading,
    error,
    saving,
    refetch: fetchEntry,
    create,
    update,
    post,
    reverse,
  };
};
