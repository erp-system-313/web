import { useState, useEffect, useCallback } from 'react';
import type { Lead, CreateLeadDto, LeadFilters, CrmDashboardStats, PipelineStage, Opportunity } from '../types/crm';
import { crmService } from '../services/crmService';

const sampleDashboard = (): CrmDashboardStats => ({
  totalLeads: 24,
  conversionRate: 32,
  pipelineValue: 185000,
  wonThisMonth: 45000,
  stageSummaries: [
    { stageId: 1, stageName: 'New', count: 8, value: 64000 },
    { stageId: 2, stageName: 'Contacted', count: 6, value: 48000 },
    { stageId: 3, stageName: 'Qualified', count: 4, value: 42000 },
    { stageId: 4, stageName: 'Proposal', count: 3, value: 31000 },
  ],
  recentActivity: [
    { id: 1, type: 'Lead Created', description: 'Acme Corp entered pipeline', timestamp: new Date().toISOString() },
    { id: 2, type: 'Deal Won', description: 'GlobalTech signed contract', timestamp: new Date().toISOString() },
  ],
});

const sampleStages = (): PipelineStage[] => [
  { id: 1, name: 'New', sequence: 1 },
  { id: 2, name: 'Contacted', sequence: 2 },
  { id: 3, name: 'Qualified', sequence: 3 },
  { id: 4, name: 'Proposal', sequence: 4 },
  { id: 5, name: 'Negotiation', sequence: 5 },
  { id: 6, name: 'Closed Won', sequence: 6 },
];

const sampleOpportunities = (): Opportunity[] => [
  { id: 1, company: 'Acme Corp', revenue: 25000, probability: 60, stageId: 1, stageName: 'New', expectedCloseDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, company: 'GlobalTech', revenue: 45000, probability: 80, stageId: 2, stageName: 'Contacted', expectedCloseDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, company: 'Startup Inc', revenue: 15000, probability: 40, stageId: 3, stageName: 'Qualified', expectedCloseDate: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const sampleLeads = (): Lead[] => [
  { id: 1, name: 'John Smith', email: 'john@acme.com', phone: '+1-555-0100', company: 'Acme Corp', status: 'NEW', source: 'WEBSITE', assignedTo: 'Sales Rep', notes: 'Interested in enterprise plan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@globaltech.com', phone: '+1-555-0101', company: 'GlobalTech', status: 'CONTACTED', source: 'REFERRAL', assignedTo: 'Sales Rep', notes: 'Follow up next week', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, name: 'Mike Brown', email: 'mike@startup.io', phone: '+1-555-0102', company: 'Startup Inc', status: 'QUALIFIED', source: 'LINKEDIN', assignedTo: 'Sales Rep', notes: 'Budget approved', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const useLeads = (filters: LeadFilters = {}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLeads = useCallback(async (f: LeadFilters = filters) => {
    setLoading(true);
    try {
      const result = await crmService.getLeads(f);
      setLeads(result.data);
      setTotal(result.total);
    } catch {
      setLeads(sampleLeads());
      setTotal(sampleLeads().length);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const createLead = async (data: CreateLeadDto): Promise<Lead> => {
    const lead = await crmService.createLead(data);
    await fetchLeads();
    return lead;
  };

  return { leads, total, loading, fetchLeads, createLead };
};

export const useLead = (id: number) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    crmService.getLead(id)
      .then(setLead)
      .catch(() => setLead(sampleLeads().find(l => l.id === id) || sampleLeads()[0]))
      .finally(() => setLoading(false));
  }, [id]);

  return { lead, loading };
};

export const usePipelineStages = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, o] = await Promise.all([
        crmService.getPipelineStages(),
        crmService.getOpportunities(),
      ]);
      setStages(s);
      setOpportunities(o);
    } catch {
      setStages(sampleStages());
      setOpportunities(sampleOpportunities());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const moveOpportunity = async (opportunityId: number, stageId: number) => {
    await crmService.updateOpportunityStage(opportunityId, stageId);
    await fetchData();
  };

  return { stages, opportunities, loading, moveOpportunity, refresh: fetchData };
};

export const useCRMDashboard = () => {
  const [stats, setStats] = useState<CrmDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    crmService.getDashboard()
      .then(setStats)
      .catch(() => setStats(sampleDashboard()))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
};
