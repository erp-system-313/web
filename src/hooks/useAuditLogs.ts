import { useState, useEffect, useCallback } from 'react';
import { auditLogsService, AuditLog } from '../services/auditLogsService';

export const useAuditLogs = (params?: {
  page?: number;
  size?: number;
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditLogsService.getAll(params);
      setData(response.content);
      setTotal(response.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [params?.page, params?.size, params?.userId, params?.action, params?.startDate, params?.endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { data, loading, error, total, refetch: fetchLogs };
};