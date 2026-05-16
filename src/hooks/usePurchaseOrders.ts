import { useState, useCallback, useRef } from "react";
import { message } from "antd";
import { purchasingService } from "../services/purchasingService";
import type {
  PurchaseOrder,
  PurchaseOrderStatus,
  CreatePurchaseOrderDto,
  PurchaseOrderFilters,
} from "../types/purchaseOrder.types";

interface UsePurchaseOrdersReturn {
  orders: PurchaseOrder[];
  loading: boolean;
  total: number;
  fetchOrders: (filters: PurchaseOrderFilters, page: number) => Promise<void>;
  getOrder: (id: number) => Promise<PurchaseOrder | null>;
  createOrder: (data: CreatePurchaseOrderDto) => Promise<PurchaseOrder>;
  createPurchaseOrder: (data: CreatePurchaseOrderDto) => Promise<void>;
  updateOrder: (id: number, data: Partial<CreatePurchaseOrderDto>) => Promise<PurchaseOrder>;
  deleteOrder: (id: number) => Promise<void>;
  cancelOrder: (id: number) => Promise<void>;
}

export const usePurchaseOrders = (): UsePurchaseOrdersReturn => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const requestIdRef = useRef(0);

  const fetchOrders = useCallback(
    async (filters: PurchaseOrderFilters, _page: number) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      try {
        const result = await purchasingService.getPurchaseOrders(filters);
        if (requestId !== requestIdRef.current) return;
        setOrders(result.data);
        setTotal(result.total);
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        message.error("Failed to fetch purchase orders");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  const getOrder = useCallback(async (id: number): Promise<PurchaseOrder | null> => {
    try {
      return await purchasingService.getPurchaseOrder(id);
    } catch (error) {
      message.error('Failed to fetch purchase order');
      return null;
    }
  }, []);

  const createOrder = useCallback(
    async (data: CreatePurchaseOrderDto): Promise<PurchaseOrder> => {
      try {
        const order = await purchasingService.createPurchaseOrder(data);
        message.success("Purchase order created successfully");
        return order;
      } catch (error) {
        message.error("Failed to create purchase order");
        throw error;
      }
    },
    [],
  );

  const createPurchaseOrder = useCallback(
    async (data: CreatePurchaseOrderDto): Promise<void> => {
      await createOrder(data);
    },
    [createOrder],
  );

  const updateOrder = useCallback(async (id: number, data: Partial<CreatePurchaseOrderDto>): Promise<PurchaseOrder> => {
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

  const deleteOrder = useCallback(async (id: number): Promise<void> => {
    try {
      await purchasingService.deletePurchaseOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      message.success("Purchase order deleted successfully");
    } catch (error) {
      message.error("Failed to delete purchase order");
      throw error;
    }
  }, []);

  const cancelOrder = useCallback(async (id: number): Promise<void> => {
    try {
      await purchasingService.cancelPurchaseOrder(id);
      setOrders((prev) => prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' as PurchaseOrderStatus } : o));
      message.success("Purchase order cancelled successfully");
    } catch (error) {
      message.error("Failed to cancel purchase order");
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
    cancelOrder,
  };
};

export default usePurchaseOrders;
