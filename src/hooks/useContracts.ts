import { useState, useEffect, useCallback } from "react";
import { hrService } from "../services/hrService";
import type { Contract, CreateContractDto } from "../types/hr";

export const useContracts = () => {
  const [data, setData] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hrService.contracts.getAll();
      setData(response.content ?? response ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch contracts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return { data, loading, error, refetch: fetchContracts };
};

export const useCreateContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateContractDto) => {
    setLoading(true);
    setError(null);
    try {
      return await hrService.contracts.create(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contract");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useUpdateContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: number, data: {
    type?: string;
    startDate?: string;
    endDate?: string;
    wage?: number;
    benefits?: string;
    status?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      return await hrService.contracts.update(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contract");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
};

export const useDeleteContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await hrService.contracts.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contract");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { remove, loading, error };
};
