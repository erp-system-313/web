import type {
  Invoice,
  Payment,
  Account,
  JournalEntry,
  InvoiceFilters,
  JournalFilters,
  AccountFilters,
  CreateInvoiceDto,
  RecordPaymentDto,
  CreateJournalEntryDto,
  CreateAccountDto,
} from "../types/finance";
import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const financeService = {
  invoices: {
    getAll: async (
      filters?: InvoiceFilters,
    ): Promise<{ items: Invoice[]; total: number }> => {
      try {
        const params = new URLSearchParams();
        params.append("page", (filters?.page || 0).toString());
        params.append("size", (filters?.size || 20).toString());

        if (filters?.search) {
          params.append("search", filters.search);
        }
        if (filters?.status) {
          params.append("status", filters.status);
        }
        if (filters?.customerId) {
          params.append("customerId", filters.customerId.toString());
        }
        if (filters?.dateFrom) {
          params.append("dateFrom", filters.dateFrom);
        }
        if (filters?.dateTo) {
          params.append("dateTo", filters.dateTo);
        }

        const response = await apiClient.get<
          ApiResponse<PageResponse<Invoice>>
        >(endpoints.invoices.list, { params });

        const pageData = response.data.data;
        return {
          items: pageData.content,
          total: pageData.totalElements,
        };
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        return { items: [], total: 0 };
      }
    },

    getById: async (id: number): Promise<Invoice | null> => {
      try {
        const response = await apiClient.get<ApiResponse<Invoice>>(
          endpoints.invoices.getById(id),
        );
        return response.data.data;
      } catch (error) {
        console.error(`Failed to fetch invoice ${id}:`, error);
        return null;
      }
    },

    create: async (data: CreateInvoiceDto): Promise<Invoice> => {
      const response = await apiClient.post<ApiResponse<Invoice>>(
        endpoints.invoices.create,
        data,
      );
      return response.data.data;
    },

    update: async (
      id: number,
      data: Partial<CreateInvoiceDto>,
    ): Promise<Invoice | null> => {
      try {
        const response = await apiClient.put<ApiResponse<Invoice>>(
          endpoints.invoices.update(id),
          data,
        );
        return response.data.data;
      } catch (error) {
        console.error(`Failed to update invoice ${id}:`, error);
        return null;
      }
    },

    delete: async (id: number): Promise<boolean> => {
      try {
        await apiClient.delete(endpoints.invoices.delete(id));
        return true;
      } catch (error) {
        console.error(`Failed to delete invoice ${id}:`, error);
        return false;
      }
    },

    recordPayment: async (data: RecordPaymentDto): Promise<Payment> => {
      const response = await apiClient.post<ApiResponse<Payment>>(
        endpoints.invoices.addPayment(data.invoiceId),
        {
          amount: data.amount,
          paymentDate: data.paymentDate,
          method: data.method,
          reference: data.reference,
        },
      );
      return response.data.data;
    },

    send: async (id: number): Promise<Invoice> => {
      const response = await apiClient.put<ApiResponse<Invoice>>(
        endpoints.invoices.send(id),
      );
      return response.data.data;
    },

    cancel: async (id: number): Promise<Invoice> => {
      const response = await apiClient.put<ApiResponse<Invoice>>(
        endpoints.invoices.cancel(id),
      );
      return response.data.data;
    },

    getPdf: async (id: number): Promise<string> => {
      try {
        const response = await apiClient.get<ApiResponse<string>>(
          endpoints.invoices.getPdf(id),
        );
        return response.data.data || "PDF generation not available";
      } catch (error) {
        console.error(`Failed to get PDF for invoice ${id}:`, error);
        return "PDF generation not available";
      }
    },
  },

  payments: {
    getByInvoice: async (invoiceId: number): Promise<Payment[]> => {
      try {
        const response = await apiClient.get<ApiResponse<Payment[]>>(
          `${endpoints.invoices.getById(invoiceId)}/payments`,
        );
        return response.data.data;
      } catch (error) {
        console.error(
          `Failed to fetch payments for invoice ${invoiceId}:`,
          error,
        );
        return [];
      }
    },
  },

  accounts: {
    getAll: async (
      filters?: AccountFilters,
    ): Promise<{ items: Account[]; total: number }> => {
      try {
        const params = new URLSearchParams();
        params.append("page", (filters?.page || 0).toString());
        params.append("size", (filters?.size || 100).toString());

        if (filters?.type) {
          params.append("type", filters.type);
        }
        if (filters?.parentId) {
          params.append("parentId", filters.parentId.toString());
        }

        const response = await apiClient.get<
          ApiResponse<PageResponse<Account>>
        >(endpoints.accounts.list, { params });

        const pageData = response.data.data;
        return {
          items: pageData.content,
          total: pageData.totalElements,
        };
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
        return { items: [], total: 0 };
      }
    },

    getById: async (id: number): Promise<Account | null> => {
      try {
        const response = await apiClient.get<ApiResponse<Account>>(
          endpoints.accounts.getById(id),
        );
        return response.data.data;
      } catch (error) {
        console.error(`Failed to fetch account ${id}:`, error);
        return null;
      }
    },

    getByType: async (type: string): Promise<Account[]> => {
      try {
        const params = new URLSearchParams();
        params.append("type", type);
        const response = await apiClient.get<
          ApiResponse<PageResponse<Account>>
        >(endpoints.accounts.list, { params });
        return response.data.data.content;
      } catch (error) {
        console.error(`Failed to fetch accounts by type ${type}:`, error);
        return [];
      }
    },

    create: async (data: CreateAccountDto): Promise<Account> => {
      const response = await apiClient.post<ApiResponse<Account>>(
        endpoints.accounts.create,
        data,
      );
      return response.data.data;
    },

    update: async (
      id: number,
      data: Partial<CreateAccountDto>,
    ): Promise<Account | null> => {
      try {
        const response = await apiClient.put<ApiResponse<Account>>(
          endpoints.accounts.update(id),
          data,
        );
        return response.data.data;
      } catch (error) {
        console.error(`Failed to update account ${id}:`, error);
        return null;
      }
    },

    delete: async (id: number): Promise<boolean> => {
      try {
        await apiClient.delete(endpoints.accounts.delete(id));
        return true;
      } catch (error) {
        console.error(`Failed to delete account ${id}:`, error);
        return false;
      }
    },
  },

  journalEntries: {
    getAll: async (
      filters?: JournalFilters,
    ): Promise<{ items: JournalEntry[]; total: number }> => {
      try {
        const params = new URLSearchParams();
        params.append("page", (filters?.page || 0).toString());
        params.append("size", (filters?.size || 20).toString());

        if (filters?.search) {
          params.append("search", filters.search);
        }
        if (filters?.status) {
          params.append("status", filters.status);
        }
        if (filters?.dateFrom) {
          params.append("dateFrom", filters.dateFrom);
        }
        if (filters?.dateTo) {
          params.append("dateTo", filters.dateTo);
        }

        const response = await apiClient.get<
          ApiResponse<PageResponse<JournalEntry>>
        >(endpoints.journal.list, { params });

        const pageData = response.data.data;
        return {
          items: pageData.content,
          total: pageData.totalElements,
        };
      } catch (error) {
        console.error("Failed to fetch journal entries:", error);
        return { items: [], total: 0 };
      }
    },

    getById: async (id: number): Promise<JournalEntry | null> => {
      try {
        const response = await apiClient.get<ApiResponse<JournalEntry>>(
          endpoints.journal.getById(id),
        );
        return response.data.data;
      } catch (error) {
        console.error(`Failed to fetch journal entry ${id}:`, error);
        return null;
      }
    },

    create: async (data: CreateJournalEntryDto): Promise<JournalEntry> => {
      const response = await apiClient.post<ApiResponse<JournalEntry>>(
        endpoints.journal.create,
        data,
      );
      return response.data.data;
    },

    update: async (
      id: number,
      data: Partial<CreateJournalEntryDto>,
    ): Promise<JournalEntry | null> => {
      try {
        const response = await apiClient.put<ApiResponse<JournalEntry>>(
          endpoints.journal.getById(id),
          data,
        );
        return response.data.data;
      } catch (error) {
        console.error(`Failed to update journal entry ${id}:`, error);
        return null;
      }
    },

    post: async (id: number): Promise<JournalEntry> => {
      const response = await apiClient.post<ApiResponse<JournalEntry>>(
        endpoints.journal.post(id),
      );
      return response.data.data;
    },

    reverse: async (id: number): Promise<JournalEntry> => {
      const response = await apiClient.put<ApiResponse<JournalEntry>>(
        endpoints.journal.reverse(id),
      );
      return response.data.data;
    },
  },
};
