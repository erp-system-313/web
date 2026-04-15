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
import {
  mockCustomers,
  mockSalesOrders,
  mockCustomerContacts,
  addSalesOrder,
  updateSalesOrder as updateMockSalesOrder,
  deleteSalesOrder as deleteMockSalesOrder,
} from "../mocks/salesMockData";
import { mockProducts } from "../mocks/productsMockData";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const salesService = {
  customers: {
    getAll: async (
      filters?: CustomerFilters,
    ): Promise<PaginatedResponse<Customer>> => {
      await delay(300);
      let items = [...mockCustomers];

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(
          (c) =>
            c.name.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search) ||
            c.phone?.includes(search),
        );
      }

      if (filters?.isActive !== undefined) {
        items = items.filter((c) => c.isActive === filters.isActive);
      }

      if (filters?.creditLimitMin !== undefined) {
        items = items.filter((c) => c.creditLimit >= filters.creditLimitMin!);
      }

      if (filters?.creditLimitMax !== undefined) {
        items = items.filter((c) => c.creditLimit <= filters.creditLimitMax!);
      }

      return {
        items,
        total: items.length,
        page: 1,
        pageSize: 10,
      };
    },

    getById: async (id: number): Promise<Customer | null> => {
      await delay(200);
      return mockCustomers.find((c) => c.id === id) || null;
    },

    getContacts: async (customerId: number): Promise<CustomerContact[]> => {
      await delay(200);
      return mockCustomerContacts.filter((c) => c.customerId === customerId);
    },

    getSalesHistory: async (customerId: number): Promise<SalesOrder[]> => {
      await delay(300);
      return mockSalesOrders.filter((o) => o.customerId === customerId);
    },
  },

  salesOrders: {
    getAll: async (
      filters?: SalesOrderFilters,
    ): Promise<PaginatedResponse<SalesOrder>> => {
      await delay(300);
      let items = [...mockSalesOrders];

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        items = items.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(search) ||
            o.customerName?.toLowerCase().includes(search),
        );
      }

      if (filters?.status) {
        items = items.filter((o) => o.status === filters.status);
      }

      if (filters?.customerId) {
        items = items.filter((o) => o.customerId === filters.customerId);
      }

      if (filters?.dateFrom) {
        items = items.filter((o) => o.orderDate >= filters.dateFrom!);
      }

      if (filters?.dateTo) {
        items = items.filter((o) => o.orderDate <= filters.dateTo!);
      }

      return {
        items,
        total: items.length,
        page: 1,
        pageSize: 10,
      };
    },

    getById: async (id: number): Promise<SalesOrder | null> => {
      await delay(200);
      return mockSalesOrders.find((o) => o.id === id) || null;
    },

    create: async (data: CreateSalesOrderDto): Promise<SalesOrder> => {
      await delay(400);
      const customer = mockCustomers.find((c) => c.id === data.customerId);
      const subtotal = data.lines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
      );
      const taxAmount = subtotal * 0.1;

      const newOrder = addSalesOrder({
        customerId: data.customerId,
        customerName: customer?.name,
        orderDate: data.orderDate,
        requiredDate: data.requiredDate,
        status: data.status,
        notes: data.notes,
        shippingAddress: data.shippingAddress,
        paymentTerms: data.paymentTerms,
        subtotal,
        taxAmount,
        totalAmount: subtotal + taxAmount,
        createdBy: 1,
        lines: data.lines.map((line, idx) => ({
          id: Date.now() + idx,
          orderId: 0,
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.unitPrice * line.quantity,
        })),
      });

      return newOrder;
    },

    update: async (
      id: number,
      data: UpdateSalesOrderDto,
    ): Promise<SalesOrder | null> => {
      await delay(400);
      return updateMockSalesOrder(id, data as Partial<SalesOrder>);
    },

    delete: async (id: number): Promise<boolean> => {
      await delay(300);
      return deleteMockSalesOrder(id);
    },
  },

  products: {
    search: async (query: string): Promise<typeof mockProducts> => {
      await delay(200);
      if (!query) return mockProducts;

      const q = query.toLowerCase();
      return mockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    },

    getById: async (id: number) => {
      await delay(100);
      return mockProducts.find((p) => p.id === id) || null;
    },
  },
};
