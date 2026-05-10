import { apiClient as api, handleApiError } from "../api/client";

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
      const response = await api.get("/v1/settings");
      const data = response.data.data;
      return {
        ...data,
        fiscalYearStart: parseInt(data.fiscalYearStart, 10) || 0,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  update: async (data: Partial<CompanySettings>): Promise<CompanySettings> => {
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== "") {
        try {
          await api.put("/v1/settings", {
            settingKey: key,
            settingValue: String(value),
          });
        } catch (error) {
          throw new Error(handleApiError(error));
        }
      }
    }

    return data as CompanySettings;
  },
};

export default settingsService;
