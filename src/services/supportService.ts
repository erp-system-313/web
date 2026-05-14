import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";
import type {
  Ticket,
  CreateTicketDto,
  UpdateTicketDto,
  TicketFilters,
  AddCommentDto,
  TicketComment,
} from "../types/support";

export const supportService = {
  async getAll(
    filters: TicketFilters = {},
  ): Promise<{ data: Ticket[]; total: number }> {
    const params: Record<string, string> = {};
    params.page = String(filters.page ?? 0);
    params.size = String(filters.size ?? 20);
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.search = filters.search;
    if (filters.createdById) params.createdById = String(filters.createdById);
    if (filters.assignedToId)
      params.assignedToId = String(filters.assignedToId);

    const response = await apiClient.get(endpoints.support.list, { params });
    return {
      data: response.data.data.content || [],
      total: response.data.data.totalElements || 0,
    };
  },

  async getById(id: number): Promise<Ticket> {
    const response = await apiClient.get(endpoints.support.getById(id));
    return response.data.data;
  },

  async create(data: CreateTicketDto): Promise<Ticket> {
    const response = await apiClient.post(endpoints.support.create, data);
    return response.data.data;
  },

  async update(id: number, data: UpdateTicketDto): Promise<Ticket> {
    const response = await apiClient.put(endpoints.support.update(id), data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(endpoints.support.delete(id));
  },

  async addComment(
    ticketId: number,
    data: AddCommentDto,
  ): Promise<TicketComment> {
    const response = await apiClient.post(
      endpoints.support.addComment(ticketId),
      data,
    );
    return response.data.data;
  },
};

export default supportService;
