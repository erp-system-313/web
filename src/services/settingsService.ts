import api, { handleApiError } from './apiClient';

export interface CompanySettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  taxNumber: string;
  fiscalYearStart: number;
  currency: string;
  timezone: string;
  dateFormat: string;
}

export const settingsService = {
  get: async (): Promise<CompanySettings> => {
    try {
      const response = await api.get('/settings');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  update: async (data: Partial<CompanySettings>): Promise<CompanySettings> => {
    try {
      const response = await api.put('/settings', data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default settingsService;