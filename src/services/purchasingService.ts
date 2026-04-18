import api from './apiClient';
import { endpoints } from '../api/endpoints';
import type { Supplier, CreateSupplierDto, SupplierFilters } from '../types/supplier.types';
import type { PurchaseOrder, CreatePurchaseOrderDto, PurchaseOrderFilters } from '../types/purchaseOrder.types';

export const purchasingService = {
  async getSuppliers(filters: SupplierFilters = {}, page = 1, size = 20): Promise<{ data: Supplier[]; total: number }> {
    const params: Record<string, string> = { page: String(page - 1), size: String(size) };
    
    if (filters.search) params.search = filters.search;
    if (filters.isActive !== undefined) params.isActive = String(filters.isActive);
    
    const response = await api.get(`${endpoints.suppliers.list}`, { params });
    return {
      data: response.data.data.content || [],
      total: response.data.data.totalElements || 0
    };
  },

  async getSupplier(id: string): Promise<Supplier | null> {
    const response = await api.get(endpoints.suppliers.getById(Number(id)));
    return response.data.data;
  },

  async createSupplier(data: CreateSupplierDto): Promise<Supplier> {
    const response = await api.post(endpoints.suppliers.list, data);
    return response.data.data;
  },

  async updateSupplier(id: string, data: Partial<CreateSupplierDto>): Promise<Supplier> {
    const response = await api.put(endpoints.suppliers.update(Number(id)), data);
    return response.data.data;
  },

  async deleteSupplier(id: string): Promise<void> {
    await api.delete(endpoints.suppliers.delete(Number(id)));
  },

  async getPurchaseOrders(filters: PurchaseOrderFilters = {}, page = 1, size = 20): Promise<{ data: PurchaseOrder[]; total: number }> {
    const params: Record<string, string> = {};
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

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    const response = await api.get(endpoints.purchaseOrders.getById(Number(id)));
    return response.data.data;
  },

  async createPurchaseOrder(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const response = await api.post(endpoints.purchaseOrders.list, data);
    return response.data.data;
  },

  async updatePurchaseOrder(id: string, data: Partial<CreatePurchaseOrderDto>): Promise<PurchaseOrder> {
    const response = await api.put(endpoints.purchaseOrders.update(Number(id)), data);
    return response.data.data;
  },

  async deletePurchaseOrder(id: string): Promise<void> {
    await api.delete(endpoints.purchaseOrders.delete(Number(id)));
  },

  async receivePurchaseOrder(id: string, lines: { lineId: number; receivedQty: number }[]): Promise<PurchaseOrder> {
    const response = await api.put(endpoints.purchaseOrders.receive(Number(id)), { lines });
    return response.data.data;
  },

  async cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
    const response = await api.put(endpoints.purchaseOrders.cancel(Number(id)));
    return response.data.data;
  },
};

export default purchasingService;