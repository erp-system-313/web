import api, { handleApiError } from './apiClient';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
}

export const hrService = {
  getEmployees: async () => {
    try {
      const response = await api.get('/employees');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getAttendance: async () => {
    try {
      const response = await api.get('/attendance');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getLeaveRequests: async () => {
    try {
      const response = await api.get('/leave-requests');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};