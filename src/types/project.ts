export type ProjectState = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id: number;
  name: string;
  customerId: number | null;
  dateStart: string | null;
  dateEnd: string | null;
  budget: number | null;
  state: ProjectState;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  customerId?: number | null;
  dateStart?: string | null;
  dateEnd?: string | null;
  budget?: number | null;
}

export interface ProjectTask {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  assignedTo: number | null;
  stageId: number | null;
  stageName: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  name: string;
  description?: string | null;
  assignedTo?: number | null;
  stageId?: number | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string | null;
  assignedTo?: number | null;
  stageId?: number | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
}

export interface TaskStage {
  id: number;
  projectId: number;
  name: string;
  sequence: number;
  isDefault: boolean;
}

export interface GanttItem {
  id: number;
  name: string;
  stageName: string | null;
  assignedTo: number | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
}

export const PROJECT_STATE_LABELS: Record<ProjectState, string> = {
  PLANNING: 'Planning',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const PROJECT_STATE_COLORS: Record<ProjectState, string> = {
  PLANNING: 'blue',
  ACTIVE: 'processing',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'default',
};
