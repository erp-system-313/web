import { apiClient as api, handleApiError } from "../api/client";

export interface AuditLog {
  id: number;
  userId: number;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: number;
  changes?: any;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface AuditLogFilters {
  entityType?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogsResponse {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const auditLogsService = {
  getAll: async (params?: {
    page?: number;
    size?: number;
    entityType?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLogsResponse> => {
    try {
      const response = await api.get("/v1/audit-logs", { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default auditLogsService;
