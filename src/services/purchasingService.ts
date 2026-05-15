import { apiClient as api } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Supplier, CreateSupplierDto, SupplierFilters } from '../types/supplier.types';
import type { PurchaseOrder, CreatePurchaseOrderDto, PurchaseOrderFilters } from '../types/purchaseOrder.types';

export const purchasingService = {
  async getSuppliers(filters: SupplierFilters = {}, page = 1, size = 20): Promise<{ data: Supplier[]; total: number }> {
    const params: Record<string, string> = { page: String(page - 1), size: String(size) };
    
    if (filters.search) params.search = filters.search;
    if (filters.isActive !== undefined) params.status = filters.isActive ? 'ACTIVE' : 'INACTIVE';
    
    const response = await api.get(`${endpoints.suppliers.list}`, { params });
    return {
      data: response.data.data.content || [],
      total: response.data.data.totalElements || 0
    };
  },

  async getSupplier(id: number): Promise<Supplier | null> {
    const response = await api.get(endpoints.suppliers.getById(id));
    return response.data.data;
  },

  async createSupplier(data: CreateSupplierDto): Promise<Supplier> {
    const response = await api.post(endpoints.suppliers.list, data);
    return response.data.data;
  },

  async updateSupplier(id: number, data: Partial<CreateSupplierDto>): Promise<Supplier> {
    const response = await api.put(endpoints.suppliers.update(id), data);
    return response.data.data;
  },

  async deleteSupplier(id: number): Promise<void> {
    await api.delete(endpoints.suppliers.delete(id));
  },

  async getPurchaseOrders(filters: PurchaseOrderFilters = {}, page = 1, size = 20): Promise<{ data: PurchaseOrder[]; total: number }> {
    const params: Record<string, string | number> = {};
    params.page = String(page - 1);
    params.size = String(size);
    
    if (filters.status) params.status = filters.status;
    if (filters.supplierId) params.supplierId = filters.supplierId;
    if (filters.search) params.search = filters.search;
    
    const response = await api.get(`${endpoints.purchaseOrders.list}`, { params });
    return {
      data: response.data.data.content || [],
      total: response.data.data.totalElements || 0
    };
  },

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | null> {
    const response = await api.get(endpoints.purchaseOrders.getById(id));
    return response.data.data;
  },

  async createPurchaseOrder(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const response = await api.post(endpoints.purchaseOrders.list, data);
    return response.data.data;
  },

  async updatePurchaseOrder(id: number, data: Partial<CreatePurchaseOrderDto>): Promise<PurchaseOrder> {
    const response = await api.put(endpoints.purchaseOrders.update(id), data);
    return response.data.data;
  },

  async deletePurchaseOrder(id: number): Promise<void> {
    await api.delete(endpoints.purchaseOrders.delete(id));
  },

  async receivePurchaseOrder(id: number, lines: { lineId: number; receivedQty: number }[]): Promise<PurchaseOrder> {
    const response = await api.put(endpoints.purchaseOrders.receive(id), { lines });
    return response.data.data;
  },

  async cancelPurchaseOrder(id: number): Promise<PurchaseOrder> {
    const response = await api.put(endpoints.purchaseOrders.cancel(id));
    return response.data.data;
  },
};

export default purchasingService;