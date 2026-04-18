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
    const settingsMap: Record<string, string> = {
      companyName: 'companyName',
      companyEmail: 'companyEmail',
      companyPhone: 'companyPhone',
      companyAddress: 'companyAddress',
      taxNumber: 'taxNumber',
      fiscalYearStart: 'fiscalYearStart',
      currency: 'currency',
      timezone: 'timezone',
      dateFormat: 'dateFormat',
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== '') {
        try {
          const settingKey = settingsMap[key] || key;
          const settingValue = String(value);
          await api.put('/settings', { settingKey, settingValue });
        } catch (error) {
          throw new Error(handleApiError(error));
        }
      }
    }

    return data as CompanySettings;
  },
};

export default settingsService;