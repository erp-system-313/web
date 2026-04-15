import { useState, useEffect, useCallback } from "react";
import { financeService } from "../services/financeService";
import type {
  Invoice,
  CreateInvoiceDto,
  RecordPaymentDto,
} from "../types/finance";

export const useInvoice = (id?: number) => {
  const [data, setData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const invoice = await financeService.invoices.getById(id);
      setData(invoice);
    } catch {
      setError("Failed to fetch invoice");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const create = async (data: CreateInvoiceDto): Promise<Invoice | null> => {
    setSaving(true);
    try {
      const newInvoice = await financeService.invoices.create(data);
      return newInvoice;
    } catch {
      setError("Failed to create invoice");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const update = async (
    updates: Partial<CreateInvoiceDto>,
  ): Promise<Invoice | null> => {
    if (!id) return null;
    setSaving(true);
    try {
      const updated = await financeService.invoices.update(id, updates);
      setData(updated);
      return updated;
    } catch {
      setError("Failed to update invoice");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const recordPayment = async (
    payment: Omit<RecordPaymentDto, "invoiceId">,
  ): Promise<boolean> => {
    if (!id) return false;
    setSaving(true);
    try {
      await financeService.invoices.recordPayment({
        ...payment,
        invoiceId: id,
      });
      await fetchInvoice();
      return true;
    } catch {
      setError("Failed to record payment");
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
    refetch: fetchInvoice,
    create,
    update,
    recordPayment,
  };
};
