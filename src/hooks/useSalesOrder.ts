import { useState, useEffect, useCallback } from "react";
import { salesService } from "../services/salesService";
import type {
  SalesOrder,
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
} from "../types/sales";

export const useSalesOrder = (id?: number) => {
  const [data, setData] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const order = await salesService.salesOrders.getById(id);
      setData(order);
    } catch (err) {
      setError("Failed to fetch sales order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const create = async (
    data: CreateSalesOrderDto,
  ): Promise<SalesOrder | null> => {
    setSaving(true);
    try {
      const newOrder = await salesService.salesOrders.create(data);
      return newOrder;
    } catch (err) {
      setError("Failed to create sales order");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const update = async (
    updates: UpdateSalesOrderDto,
  ): Promise<SalesOrder | null> => {
    if (!id) return null;
    setSaving(true);
    try {
      const updated = await salesService.salesOrders.update(id, updates);
      setData(updated);
      return updated;
    } catch (err) {
      setError("Failed to update sales order");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (): Promise<boolean> => {
    if (!id) return false;
    setSaving(true);
    try {
      await salesService.salesOrders.delete(id);
      return true;
    } catch (err) {
      setError("Failed to delete sales order");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    data,
    loading,
    error,
    saving,
    refetch: fetchOrder,
    create,
    update,
    remove,
  };
};
