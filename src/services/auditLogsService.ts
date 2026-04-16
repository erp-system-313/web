import api, { handleApiError } from './apiClient';

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  entity: string;
  entityId: number;
  details: string;
  ipAddress: string;
  timestamp: string;
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
    userId?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLogsResponse> => {
    try {
      const response = await api.get('/audit-logs', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default auditLogsService;