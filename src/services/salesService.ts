import type {
  Customer,
  CustomerContact,
  SalesOrder,
  SalesOrderFilters,
  CustomerFilters,
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  PaginatedResponse,
} from "../types/sales";
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

export const salesService = {
  customers: {
    getAll: async (
      filters?: CustomerFilters,
    ): Promise<PaginatedResponse<Customer>> => {
      try {
        const params = new URLSearchParams();
        params.append("page", (filters?.page || 0).toString());
        params.append("size", (filters?.size || 20).toString());

        if (filters?.search) {
          params.append("search", filters.search);
        }
        if (filters?.isActive !== undefined) {
          params.append("isActive", filters.isActive.toString());
        }

        const response = await apiClient.get<
          ApiResponse<PageResponse<Customer>>
        >(endpoints.customers.list, { params });

        const pageData = response.data.data;
        return {
          items: pageData.content,
          total: pageData.totalElements,
          page: pageData.number,
          pageSize: pageData.size,
        };
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        return { items: [], total: 0, page: 0, pageSize: 20 };
      }
    },

    getById: async (id: number): Promise<Customer | null> => {
      try {
        const response = await apiClient.get<ApiResponse<Customer>>(
          endpoints.customers.getById(id),
        );
        return response.data.data;
      } catch (error) {
        console.error(`Failed to fetch customer ${id}:`, error);
        return null;
      }
    },

    getContacts: async (customerId: number): Promise<CustomerContact[]> => {
      try {
        const response = await apiClient.get<ApiResponse<CustomerContact[]>>(
          endpoints.customers.getOrders(customerId),
        );
        return response.data.data;
      } catch (error) {
        console.error(
          `Failed to fetch contacts for customer ${customerId}:`,
          error,
        );
        return [];
      }
    },

    getSalesHistory: async (customerId: number): Promise<SalesOrder[]> => {
      try {
        const response = await apiClient.get<ApiResponse<SalesOrder[]>>(
          endpoints.customers.getOrders(customerId),
        );
        return response.data.data;
      } catch (error) {
        console.error(
          `Failed to fetch sales history for customer ${customerId}:`,
          error,
        );
        return [];
      }
    },

    create: async (data: Partial<Customer>): Promise<Customer> => {
      const response = await apiClient.post<ApiResponse<Customer>>(
        endpoints.customers.create,
        data,
      );
      return response.data.data;
    },

    update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
      const response = await apiClient.put<ApiResponse<Customer>>(
        endpoints.customers.update(id),
        data,
      );
      return response.data.data;
    },

    delete: async (id: number): Promise<boolean> => {
      try {
        await apiClient.delete(endpoints.customers.delete(id));
        return true;
      } catch (error) {
        console.error(`Failed to delete customer ${id}:`, error);
        return false;
      }
    },
  },

  salesOrders: {
    getAll: async (
      filters?: SalesOrderFilters,
    ): Promise<PaginatedResponse<SalesOrder>> => {
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
          const dateFromVal = String(filters.dateFrom);
          params.append("dateFrom", dateFromVal);
        }
        if (filters?.dateTo) {
          const dateToVal = String(filters.dateTo);
          params.append("dateTo", dateToVal);
        }

        const response = await apiClient.get<
          ApiResponse<PageResponse<SalesOrder>>
        >(endpoints.salesOrders.list, { params });

        const pageData = response.data.data;
        return {
          items: pageData.content,
          total: pageData.totalElements,
          page: pageData.number,
          pageSize: pageData.size,
        };
      } catch (error) {
        console.error("Failed to fetch sales orders:", error);
        return { items: [], total: 0, page: 0, pageSize: 20 };
      }
    },

    getById: async (id: number): Promise<SalesOrder | null> => {
      try {
        const response = await apiClient.get<ApiResponse<SalesOrder>>(
          endpoints.salesOrders.getById(id),
        );
        return response.data.data;
      } catch (error) {
        console.error(`Failed to fetch sales order ${id}:`, error);
        return null;
      }
    },

    create: async (data: CreateSalesOrderDto): Promise<SalesOrder> => {
      const response = await apiClient.post<ApiResponse<SalesOrder>>(
        endpoints.salesOrders.create,
        data,
      );
      return response.data.data;
    },

    update: async (
      id: number,
      data: UpdateSalesOrderDto,
    ): Promise<SalesOrder | null> => {
      try {
        const response = await apiClient.put<ApiResponse<SalesOrder>>(
          endpoints.salesOrders.update(id),
          data,
        );
        return response.data.data;
      } catch (error) {
        console.error(`Failed to update sales order ${id}:`, error);
        return null;
      }
    },

    delete: async (id: number): Promise<boolean> => {
      try {
        await apiClient.delete(endpoints.salesOrders.delete(id));
        return true;
      } catch (error) {
        console.error(`Failed to delete sales order ${id}:`, error);
        return false;
      }
    },

    confirm: async (id: number): Promise<SalesOrder> => {
      const response = await apiClient.put<ApiResponse<SalesOrder>>(
        endpoints.salesOrders.confirm(id),
      );
      return response.data.data;
    },

    ship: async (id: number): Promise<SalesOrder> => {
      const response = await apiClient.put<ApiResponse<SalesOrder>>(
        endpoints.salesOrders.ship(id),
      );
      return response.data.data;
    },

    cancel: async (id: number): Promise<SalesOrder> => {
      const response = await apiClient.put<ApiResponse<SalesOrder>>(
        endpoints.salesOrders.cancel(id),
      );
      return response.data.data;
    },
  },

  products: {
    search: async (query: string): Promise<Customer[]> => {
      try {
        const params = new URLSearchParams();
        params.append("search", query);

        const response = await apiClient.get<
          ApiResponse<PageResponse<Customer>>
        >(endpoints.products.list, { params });
        return response.data.data.content;
      } catch (error) {
        console.error("Failed to search products:", error);
        return [];
      }
    },

    getById: async (id: number) => {
      try {
        const response = await apiClient.get(endpoints.products.getById(id));
        return response.data.data;
      } catch (error) {
        console.error(`Failed to fetch product ${id}:`, error);
        return null;
      }
    },
  },
};
