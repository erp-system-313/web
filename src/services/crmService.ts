import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Lead, CreateLeadDto, LeadFilters, CrmDashboardStats, PipelineStage, Opportunity, ConvertLeadPayload } from '../types/crm';

export const crmService = {
  async getDashboard(): Promise<CrmDashboardStats> {
    const response = await apiClient.get(endpoints.crm.dashboard);
    return response.data.data;
  },

  async getLeads(filters: LeadFilters = {}): Promise<{ data: Lead[]; total: number }> {
    const params: Record<string, string> = {};
    params.page = String(filters.page ?? 0);
    params.size = String(filters.size ?? 20);
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;

    const response = await apiClient.get(endpoints.crm.leads, { params });
    return {
      data: response.data.data.content || [],
      total: response.data.data.totalElements || 0,
    };
  },

  async getLead(id: number): Promise<Lead> {
    const response = await apiClient.get(endpoints.crm.leadById(id));
    return response.data.data;
  },

  async createLead(data: CreateLeadDto): Promise<Lead> {
    const response = await apiClient.post(endpoints.crm.leads, data);
    return response.data.data;
  },

  async updateLead(id: number, data: Partial<CreateLeadDto>): Promise<Lead> {
    const response = await apiClient.put(endpoints.crm.leadById(id), data);
    return response.data.data;
  },

  async convertLead(id: number, payload?: ConvertLeadPayload): Promise<Opportunity> {
    const response = await apiClient.post(endpoints.crm.convertLead(id), payload ?? {});
    return response.data.data;
  },

  async getPipelineStages(): Promise<PipelineStage[]> {
    const response = await apiClient.get(endpoints.crm.pipelines);
    const data = response.data?.data;
    return Array.isArray(data) ? data : [];
  },

  async getOpportunities(): Promise<Opportunity[]> {
    const response = await apiClient.get(endpoints.crm.opportunities);
    const data = response.data?.data;
    return Array.isArray(data) ? data : [];
  },

  async updateOpportunityStage(id: number, stageId: number): Promise<Opportunity> {
    const response = await apiClient.put(endpoints.crm.opportunityStage(id), { stageId });
    return response.data.data;
  },
};

export default crmService;
