import { apiClient as api, handleApiError } from "../api/client";
import type {
  Employee,
  Attendance,
  LeaveRequest,
  LeaveBalance,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  Department,
  JobPosition,
} from "../types/hr";

export const hrService = {
  employees: {
    getAll: async (params?: {
      page?: number;
      size?: number;
      search?: string;
      departmentId?: number;
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

    create: async (data: CreateEmployeeDto): Promise<Employee> => {
      try {
        const response = await api.post("/v1/employees", data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (
      id: number,
      data: UpdateEmployeeDto,
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

    clockIn: async (employeeId?: number): Promise<Attendance> => {
      try {
        const params = employeeId ? { employeeId } : {};
        const response = await api.post("/v1/attendance/clock-in", null, { params });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    clockOut: async (employeeId?: number): Promise<Attendance> => {
      try {
        const params = employeeId ? { employeeId } : {};
        const response = await api.post("/v1/attendance/clock-out", null, { params });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getClockedInEmployees: async (): Promise<{ employeeId: number; employeeName: string }[]> => {
      try {
        const response = await api.get("/v1/attendance/clocked-in");
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    markAttendance: async (data: {
      employeeId: number;
      date: string;
      status: string;
      checkIn?: string;
      checkOut?: string;
      notes?: string;
    }): Promise<Attendance> => {
      try {
        const response = await api.post("/v1/attendance/manual", data);
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
