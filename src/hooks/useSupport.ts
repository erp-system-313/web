import { useState, useEffect, useCallback } from "react";
import type {
  Ticket,
  TicketFilters,
  CreateTicketDto,
  UpdateTicketDto,
} from "../types/support";
import { supportService } from "../services/supportService";

export const useTickets = (filters: TicketFilters = {}) => {
  const [data, setData] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (f: TicketFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await supportService.getAll(f);
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tickets");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, total, loading, error, refetch };
};

export const useTicket = (id: number) => {
  const [data, setData] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await supportService.getById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch ticket");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};

export const useCreateTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTicket = useCallback(async (data: CreateTicketDto) => {
    setLoading(true);
    setError(null);
    try {
      const ticket = await supportService.create(data);
      return ticket;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create ticket";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTicket, loading, error };
};

export const useUpdateTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTicket = useCallback(
    async (id: number, data: UpdateTicketDto) => {
      setLoading(true);
      setError(null);
      try {
        const ticket = await supportService.update(id, data);
        return ticket;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to update ticket";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { updateTicket, loading, error };
};
