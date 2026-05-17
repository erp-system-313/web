export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

export interface PipelineStage {
  id: number;
  name: string;
  sequence: number;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source: string;
  assignedTo: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone: string;
  company: string;
  source?: string;
  assignedTo?: string;
  notes?: string;
  status?: LeadStatus;
}

export interface Opportunity {
  id: number;
  leadId?: number;
  customerId?: number;
  company: string;
  stageId: number;
  stageName: string;
  revenue: number;
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConvertLeadPayload {
  stageId: number;
  revenue?: number;
  probability?: number;
  closeDate?: string;
}

export interface CrmDashboardStats {
  totalLeads: number;
  conversionRate: number;
  pipelineValue: number;
  wonThisMonth: number;
  stageSummaries: {
    stageId: number;
    stageName: string;
    count: number;
    value: number;
  }[];
  recentActivity: {
    id: number;
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export interface LeadFilters {
  page?: number;
  size?: number;
  status?: LeadStatus;
  search?: string;
}
