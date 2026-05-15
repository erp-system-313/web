export interface JobOpening {
  id: number;
  title: string;
  departmentId?: number;
  departmentName?: string;
  description?: string;
  requirements?: string;
  expectedSalary?: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface RecruitmentStage {
  id: number;
  name: string;
  sequence: number;
}

export interface RecruitmentSource {
  id: number;
  name: string;
}

export interface Applicant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  stageId: number;
  stageName?: string;
  jobOpeningId: number;
  jobOpeningTitle?: string;
  sourceId?: number;
  sourceName?: string;
  salaryExpected?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
