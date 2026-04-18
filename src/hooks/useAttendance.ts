import { useState, useEffect, useCallback } from 'react';
import { hrService, type Attendance } from '../services/hrService';

interface AttendanceFilters {
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}

export const useAttendance = (filters?: AttendanceFilters) => {
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await hrService.attendance.getAll(filters);
      setData(response.content || []);
      setTotal(response.totalElements || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters?.employeeId, filters?.dateFrom, filters?.dateTo]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return { data, loading, error, total, refetch: fetchAttendance };
};

export const useClockIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clockIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await hrService.attendance.clockIn();
      return result;
    } catch (err) {
      setError('Failed to clock in');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { clockIn, loading, error };
};

export const useClockOut = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clockOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await hrService.attendance.clockOut();
      return result;
    } catch (err) {
      setError('Failed to clock out');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { clockOut, loading, error };
};
