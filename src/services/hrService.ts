import api, { handleApiError } from './apiClient';
import type {
  Employee,
  EmployeeFilters,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  Attendance,
  AttendanceFilters,
  LeaveRequest,
  LeaveRequestFilters,
  CreateLeaveRequestDto,
  LeaveBalance,
} from '../types/hr';

export interface EmployeesResponse {
  content: Employee[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AttendanceResponse {
  content: Attendance[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface LeaveRequestsResponse {
  content: LeaveRequest[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const hrService = {
  employees: {
    getAll: async (filters?: EmployeeFilters): Promise<EmployeesResponse> => {
      try {
        const response = await api.get('/employees', { params: filters });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getById: async (id: number): Promise<Employee> => {
      try {
        const response = await api.get(`/employees/${id}`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: CreateEmployeeDto): Promise<Employee> => {
      try {
        const response = await api.post('/employees', data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (id: number, data: UpdateEmployeeDto): Promise<Employee> => {
      try {
        const response = await api.put(`/employees/${id}`, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await api.delete(`/employees/${id}`);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getAttendance: async (id: number): Promise<AttendanceResponse> => {
      try {
        const response = await api.get(`/employees/${id}/attendance`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  attendance: {
    getAll: async (filters?: AttendanceFilters): Promise<AttendanceResponse> => {
      try {
        const response = await api.get('/attendance', { params: filters });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    clockIn: async (): Promise<Attendance> => {
      try {
        const response = await api.post('/attendance/clock-in');
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    clockOut: async (): Promise<Attendance> => {
      try {
        const response = await api.post('/attendance/clock-out');
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  leave: {
    getAll: async (filters?: LeaveRequestFilters): Promise<LeaveRequestsResponse> => {
      try {
        const response = await api.get('/leave-requests', { params: filters });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getById: async (id: number): Promise<LeaveRequest> => {
      try {
        const response = await api.get(`/leave-requests/${id}`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
      try {
        const response = await api.post('/leave-requests', data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    approve: async (id: number): Promise<LeaveRequest> => {
      try {
        const response = await api.put(`/leave-requests/${id}/approve`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    reject: async (id: number): Promise<LeaveRequest> => {
      try {
        const response = await api.put(`/leave-requests/${id}/reject`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getBalances: async (): Promise<LeaveBalance[]> => {
      try {
        const response = await api.get('/leave-balances');
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },
};

export default hrService;