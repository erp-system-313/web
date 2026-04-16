import { useState, useCallback } from 'react';
import { message } from 'antd';
import { purchasingService } from '../services/purchasingService';
import type { PurchaseOrder, CreatePurchaseOrderDto, PurchaseOrderFilters } from '../types/purchaseOrder.types';

interface UsePurchaseOrdersReturn {
  orders: PurchaseOrder[];
  loading: boolean;
  total: number;
  fetchOrders: (filters: PurchaseOrderFilters, page: number) => Promise<void>;
  getOrder: (id: string) => Promise<PurchaseOrder | null>;
  createOrder: (data: CreatePurchaseOrderDto) => Promise<PurchaseOrder>;
  createPurchaseOrder: (data: CreatePurchaseOrderDto) => Promise<void>;
  updateOrder: (id: string, data: Partial<CreatePurchaseOrderDto>) => Promise<PurchaseOrder>;
  deleteOrder: (id: string) => Promise<void>;
}

export const usePurchaseOrders = (): UsePurchaseOrdersReturn => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(async (filters: PurchaseOrderFilters, _page: number) => {
    setLoading(true);
    try {
      const result = await purchasingService.getPurchaseOrders(filters);
      setOrders(result.data);
      setTotal(result.total);
    } catch (error) {
      message.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrder = useCallback(async (id: string): Promise<PurchaseOrder | null> => {
    try {
      return await purchasingService.getPurchaseOrder(id);
    } catch (error) {
      message.error('Failed to fetch purchase order');
      return null;
    }
  }, []);

  const createOrder = useCallback(async (data: CreatePurchaseOrderDto): Promise<PurchaseOrder> => {
    try {
      const order = await purchasingService.createPurchaseOrder(data);
      message.success('Purchase order created successfully');
      return order;
    } catch (error) {
      message.error('Failed to create purchase order');
      throw error;
    }
  }, []);

  const createPurchaseOrder = useCallback(async (data: CreatePurchaseOrderDto): Promise<void> => {
    await createOrder(data);
  }, [createOrder]);

  const updateOrder = useCallback(async (id: string, data: Partial<CreatePurchaseOrderDto>): Promise<PurchaseOrder> => {
    try {
      const order = await purchasingService.updatePurchaseOrder(id, data);
      setOrders(prev => prev.map(o => o.id === id ? order : o));
      message.success('Purchase order updated successfully');
      return order;
    } catch (error) {
      message.error('Failed to update purchase order');
      throw error;
    }
  }, []);

  const deleteOrder = useCallback(async (id: string): Promise<void> => {
    try {
      await purchasingService.deletePurchaseOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      message.success('Purchase order deleted successfully');
    } catch (error) {
      message.error('Failed to delete purchase order');
      throw error;
    }
  }, []);

  return {
    orders,
    loading,
    total,
    fetchOrders,
    getOrder,
    createOrder,
    createPurchaseOrder,
    updateOrder,
    deleteOrder,
  };
};

export default usePurchaseOrders;
