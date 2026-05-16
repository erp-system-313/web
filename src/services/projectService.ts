import { apiClient as api, handleApiError } from "../api/client";
import type { Project, CreateProjectRequest, ProjectTask, CreateTaskRequest, UpdateTaskRequest, TaskStage, GanttItem, ProjectState } from "../types/project";

export interface ProjectListParams {
  page?: number;
  size?: number;
  state?: ProjectState;
  search?: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const projectService = {
  getAll: async (params?: ProjectListParams): Promise<PageResponse<Project>> => {
    try {
      const response = await api.get('/v1/projects', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getById: async (id: number): Promise<Project> => {
    try {
      const response = await api.get(`/v1/projects/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  create: async (data: CreateProjectRequest): Promise<Project> => {
    try {
      const response = await api.post('/v1/projects', data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateState: async (id: number, state: ProjectState): Promise<Project> => {
    try {
      const response = await api.patch(`/v1/projects/${id}/state`, { state });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/v1/projects/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStages: async (projectId: number): Promise<TaskStage[]> => {
    try {
      const response = await api.get(`/v1/projects/${projectId}/stages`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getTasks: async (projectId: number): Promise<ProjectTask[]> => {
    try {
      const response = await api.get(`/v1/projects/${projectId}/tasks`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  createTask: async (projectId: number, data: CreateTaskRequest): Promise<ProjectTask> => {
    try {
      const response = await api.post(`/v1/projects/${projectId}/tasks`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateTask: async (taskId: number, data: UpdateTaskRequest): Promise<ProjectTask> => {
    try {
      const response = await api.put(`/v1/tasks/${taskId}`, data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  deleteTask: async (taskId: number): Promise<void> => {
    try {
      await api.delete(`/v1/tasks/${taskId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getGantt: async (projectId: number): Promise<GanttItem[]> => {
    try {
      const response = await api.get(`/v1/projects/${projectId}/gantt`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default projectService;
