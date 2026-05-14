export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Ticket {
  id: number;
  title: string;
  description?: string;
  customerId: number;
  customerName?: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedToId?: number;
  assignedToName?: string;
  createdById?: number;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
}

export interface TicketComment {
  id: number;
  ticketId: number;
  authorId: number;
  authorName: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface CreateTicketDto {
  title: string;
  description?: string;
  customerId: number;
  priority: TicketPriority;
}

export interface AddCommentDto {
  message: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assignedTo?: number;
}

export interface TicketFilters {
  page?: number;
  size?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
}
