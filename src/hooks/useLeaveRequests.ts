import { useState, useEffect, useCallback } from 'react';
import { hrService } from '../services/hrService';
import type { LeaveRequest, LeaveRequestFilters, CreateLeaveRequestDto, LeaveBalance } from '../types/hr';

export const useLeaveRequests = (filters?: LeaveRequestFilters) => {
  const [data, setData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hrService.leave.getAll(filters);
      setData(response.items);
      setTotal(response.total);
    } catch (err) {
      setError('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  }, [filters?.employeeId, filters?.status, filters?.type]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  return { data, loading, error, total, refetch: fetchLeaveRequests };
};

export const useLeaveBalances = () => {
  const [data, setData] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hrService.leave.getBalances();
      setData(response);
    } catch (err) {
      setError('Failed to fetch leave balances');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { data, loading, error, refetch: fetchBalances };
};

export const useCreateLeaveRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: CreateLeaveRequestDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await hrService.leave.create(data);
      return result;
    } catch (err) {
      setError('Failed to create leave request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useApproveLeaveRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await hrService.leave.approve(id);
      return result;
    } catch (err) {
      setError('Failed to approve leave request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { approve, loading, error };
};

export const useRejectLeaveRequest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reject = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await hrService.leave.reject(id);
      return result;
    } catch (err) {
      setError('Failed to reject leave request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reject, loading, error };
};
