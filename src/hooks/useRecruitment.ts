import { useState, useEffect, useCallback } from 'react';
import type { Applicant, JobOpening, RecruitmentStage } from '../types/recruitment';
import { recruitmentService } from '../services/recruitmentService';

export const useJobOpenings = () => {
  const [data, setData] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await recruitmentService.jobOpenings.getAll();
      setData(result);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, refetch: fetch };
};

export const useRecruitmentStages = () => {
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        recruitmentService.stages.getAll(),
        recruitmentService.applicants.getAll(),
      ]);
      setStages(s);
      setApplicants(a);
    } catch {
      setStages([]);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const moveApplicant = async (applicantId: number, stageId: number) => {
    await recruitmentService.applicants.updateStage(applicantId, stageId);
    await fetchData();
  };

  const createApplicant = async (data: Partial<Applicant>): Promise<Applicant> => {
    const applicant = await recruitmentService.applicants.create(data);
    await fetchData();
    return applicant;
  };

  return { stages, applicants, loading, moveApplicant, createApplicant, refresh: fetchData };
};

export const useApplicant = (id: number | null) => {
  const [data, setData] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    recruitmentService.applicants.getById(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading };
};

export const useCreateJobOpening = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: Partial<JobOpening>) => {
    setLoading(true);
    setError(null);
    try {
      return await recruitmentService.jobOpenings.create(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job opening");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
};

export const useUpdateJobOpening = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: number, data: Partial<JobOpening>) => {
    setLoading(true);
    setError(null);
    try {
      return await recruitmentService.jobOpenings.update(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job opening");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
};

export const useDeleteJobOpening = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteJo = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await recruitmentService.jobOpenings.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job opening");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { delete: deleteJo, loading, error };
};
