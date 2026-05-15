import { useState, useEffect, useCallback } from 'react';
import type { Lead, CreateLeadDto, LeadFilters, CrmDashboardStats, PipelineStage, Opportunity } from '../types/crm';
import { crmService } from '../services/crmService';

export const useLeads = (filters: LeadFilters = {}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (f: LeadFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await crmService.getLeads(f);
      setLeads(result.data);
      setTotal(result.total);
    } catch {
      setError('Failed to load leads');
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

  return { leads, total, loading, error, fetchLeads, createLead };
};

export const useLead = (id: number) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    crmService.getLead(id)
      .then(setLead)
      .catch(() => setError('Failed to load lead'))
      .finally(() => setLoading(false));
  }, [id]);

  return { lead, loading, error };
};

export const usePipelineStages = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, o] = await Promise.all([
        crmService.getPipelineStages(),
        crmService.getOpportunities(),
      ]);
      setStages(s);
      setOpportunities(o);
    } catch {
      setError('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const moveOpportunity = async (opportunityId: number, stageId: number) => {
    try {
      await crmService.updateOpportunityStage(opportunityId, stageId);
    } catch {
      const stage = stages.find(s => s.id === stageId);
      setOpportunities(prev =>
        prev.map(o => o.id === opportunityId ? { ...o, stageId, stageName: stage?.name || o.stageName } : o)
      );
      return false;
    }
    await fetchData();
    return true;
  };

  return { stages, opportunities, loading, error, moveOpportunity, refresh: fetchData };
};

export const useCRMDashboard = () => {
  const [stats, setStats] = useState<CrmDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    crmService.getDashboard()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
};
