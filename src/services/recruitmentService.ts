import { apiClient as api, handleApiError } from "../api/client";
import type { JobOpening, RecruitmentStage, RecruitmentSource, Applicant } from "../types/recruitment";

export const recruitmentService = {
  jobOpenings: {
    getAll: async (): Promise<JobOpening[]> => {
      try {
        const response = await api.get("/v1/job-openings");
        return response.data.data?.content ?? response.data.data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getById: async (id: number): Promise<JobOpening> => {
      try {
        const response = await api.get(`/v1/job-openings/${id}`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: Partial<JobOpening>): Promise<JobOpening> => {
      try {
        const response = await api.post("/v1/job-openings", data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (id: number, data: Partial<JobOpening>): Promise<JobOpening> => {
      try {
        const response = await api.put(`/v1/job-openings/${id}`, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await api.delete(`/v1/job-openings/${id}`);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  stages: {
    getAll: async (): Promise<RecruitmentStage[]> => {
      try {
        const response = await api.get("/v1/recruitment-stages");
        return response.data.data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  sources: {
    getAll: async (): Promise<RecruitmentSource[]> => {
      try {
        const response = await api.get("/v1/recruitment-sources");
        return response.data.data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  applicants: {
    getAll: async (params?: { jobOpeningId?: number; stageId?: number }): Promise<Applicant[]> => {
      try {
        const response = await api.get("/v1/applicants", { params });
        return response.data.data?.content ?? response.data.data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getById: async (id: number): Promise<Applicant> => {
      try {
        const response = await api.get(`/v1/applicants/${id}`);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    create: async (data: Partial<Applicant>): Promise<Applicant> => {
      try {
        const response = await api.post("/v1/applicants", data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    update: async (id: number, data: Partial<Applicant>): Promise<Applicant> => {
      try {
        const response = await api.put(`/v1/applicants/${id}`, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    delete: async (id: number): Promise<void> => {
      try {
        await api.delete(`/v1/applicants/${id}`);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    updateStage: async (id: number, stageId: number): Promise<Applicant> => {
      try {
        const response = await api.put(`/v1/applicants/${id}/stage`, { stageId });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },
};

export default recruitmentService;
