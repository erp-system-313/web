import { apiClient as api, handleApiError } from "../api/client";
import type {
  EmployeeStatus,
  AttendanceStatus,
  LeaveType,
  LeaveStatus,
  Department,
  JobPosition,
} from "../types/hr";

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  departmentId?: number;
  departmentName?: string;
  position: string;
  positionId?: number;
  positionName?: string;
  hireDate: string;
  terminationDate?: string;
  salary?: number;
  status: EmployeeStatus;
  address?: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId?: number;
  positionId?: number;
  hireDate?: string;
  salary?: number;
  address?: string;
  userId?: number;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: number;
  positionId?: number;
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
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  type: LeaveType;
  status: LeaveStatus;
  reason: string;
  rejectionReason?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  employeeName: string;
  type: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export const hrService = {
  employees: {
    getAll: async (params?: {
      page?: number;
      size?: number;
      search?: string;
      department?: string;
      status?: string;
    }) => {
      try {
        const response = await api.get("/v1/employees", { params });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getById: async (id: number): Promise<Employee> => {
      try {
        const response = await api.get(`/v1/employees/${id}`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: CreateEmployeeRequest): Promise<Employee> => {
      try {
        const response = await api.post("/v1/employees", data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (
      id: number,
      data: UpdateEmployeeRequest,
    ): Promise<Employee> => {
      try {
        const response = await api.put(`/v1/employees/${id}`, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await api.delete(`/v1/employees/${id}`);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  departments: {
    getAll: async (): Promise<Department[]> => {
      try {
        const response = await api.get("/v1/departments");
        return response.data.data?.content ?? response.data.data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getById: async (id: number): Promise<Department> => {
      try {
        const response = await api.get(`/v1/departments/${id}`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: Partial<Department>): Promise<Department> => {
      try {
        const response = await api.post("/v1/departments", data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (id: number, data: Partial<Department>): Promise<Department> => {
      try {
        const response = await api.put(`/v1/departments/${id}`, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await api.delete(`/v1/departments/${id}`);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  jobPositions: {
    getAll: async (): Promise<JobPosition[]> => {
      try {
        const response = await api.get("/v1/job-positions");
        return response.data.data?.content ?? response.data.data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getById: async (id: number): Promise<JobPosition> => {
      try {
        const response = await api.get(`/v1/job-positions/${id}`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: Partial<JobPosition>): Promise<JobPosition> => {
      try {
        const response = await api.post("/v1/job-positions", data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (id: number, data: Partial<JobPosition>): Promise<JobPosition> => {
      try {
        const response = await api.put(`/v1/job-positions/${id}`, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await api.delete(`/v1/job-positions/${id}`);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  attendance: {
    getAll: async (params?: {
      page?: number;
      size?: number;
      employeeId?: number;
      startDate?: string;
      endDate?: string;
    }) => {
      try {
        const response = await api.get("/v1/attendance", { params });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    clockIn: async (): Promise<Attendance> => {
      try {
        const response = await api.post("/v1/attendance/clock-in");
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    clockOut: async (): Promise<Attendance> => {
      try {
        const response = await api.post("/v1/attendance/clock-out");
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  leave: {
    getAll: async (params?: {
      page?: number;
      size?: number;
      employeeId?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      try {
        const response = await api.get("/v1/leave-requests", { params });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getBalances: async (employeeId?: number): Promise<LeaveBalance[]> => {
      try {
        const response = await api.get("/v1/leave-balances", {
          params: { employeeId },
        });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: {
      employeeId: number;
      type: string;
      startDate: string;
      endDate: string;
      reason?: string;
    }): Promise<LeaveRequest> => {
      try {
        const response = await api.post("/v1/leave-requests", data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    allocate: async (data: {
      employeeId: number;
      type: string;
      totalDays: number;
      year: number;
    }): Promise<LeaveBalance> => {
      try {
        const response = await api.post("/v1/leave-balances", data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    approve: async (id: number): Promise<LeaveRequest> => {
      try {
        const response = await api.put(`/v1/leave-requests/${id}/approve`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    reject: async (id: number, reason?: string): Promise<LeaveRequest> => {
      try {
        const response = await api.put(`/v1/leave-requests/${id}/reject`, { reason });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  contracts: {
    getAll: async (params?: {
      page?: number;
      size?: number;
      employeeId?: number;
      status?: string;
    }) => {
      try {
        const response = await api.get("/v1/contracts", { params });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: {
      employeeId: number;
      type: string;
      startDate: string;
      endDate?: string;
      wage?: number;
      benefits?: string;
    }) => {
      try {
        const response = await api.post("/v1/contracts", data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (id: number, data: {
      type?: string;
      startDate?: string;
      endDate?: string;
      wage?: number;
      benefits?: string;
      status?: string;
    }) => {
      try {
        const response = await api.put(`/v1/contracts/${id}`, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await api.delete(`/v1/contracts/${id}`);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },
};

export default hrService;
