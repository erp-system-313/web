import api, { handleApiError } from './apiClient';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
  phone?: string;
  hireDate?: string;
  salary?: number;
  address?: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  phone?: string;
  hireDate?: string;
  salary?: number;
  address?: string;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: string;
  position?: string;
  phone?: string;
  salary?: number;
  address?: string;
  status?: string;
}

export interface Attendance {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours: number;
  status: string;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  approvedBy?: string;
  createdAt: string;
}

export interface LeaveBalance {
  employeeId: number;
  annual: number;
  sick: number;
  personal: number;
  used: {
    annual: number;
    sick: number;
    personal: number;
  };
}

export const hrService = {
  employees: {
    getAll: async (params?: { page?: number; size?: number; search?: string; department?: string; status?: string }) => {
      try {
        const response = await api.get('/employees', { params });
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

    create: async (data: CreateEmployeeRequest): Promise<Employee> => {
      try {
        const response = await api.post('/employees', data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (id: number, data: UpdateEmployeeRequest): Promise<Employee> => {
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
  },

  attendance: {
    getAll: async (params?: { page?: number; size?: number; employeeId?: number; startDate?: string; endDate?: string }) => {
      try {
        const response = await api.get('/attendance', { params });
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
    getAll: async (params?: { page?: number; size?: number; employeeId?: number; status?: string }) => {
      try {
        const response = await api.get('/leave-requests', { params });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getBalances: async (employeeId?: number): Promise<LeaveBalance> => {
      try {
        const response = await api.get('/leave-balances', { params: { employeeId } });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: { employeeId: number; type: string; startDate: string; endDate: string; reason: string }): Promise<LeaveRequest> => {
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
  },
};

export default hrService;