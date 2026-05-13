import { useState, useEffect, useCallback } from 'react';
import type { Lead, CreateLeadDto, LeadFilters, CrmDashboardStats, PipelineStage, Opportunity } from '../types/crm';
import { crmService } from '../services/crmService';

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
      setLeads([]);
      setTotal(0);
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
      .catch(() => setLead(null))
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
      setStages([]);
      setOpportunities([]);
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
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
};
