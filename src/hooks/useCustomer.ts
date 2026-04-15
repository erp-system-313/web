import { useState, useEffect, useCallback } from "react";
import { salesService } from "../services/salesService";
import type { Customer, CustomerContact, SalesOrder } from "../types/sales";

export const useCustomer = (id?: number) => {
  const [data, setData] = useState<Customer | null>(null);
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [salesHistory, setSalesHistory] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [customer, customerContacts, history] = await Promise.all([
        salesService.customers.getById(id),
        salesService.customers.getContacts(id),
        salesService.customers.getSalesHistory(id),
      ]);
      setData(customer);
      setContacts(customerContacts);
      setSalesHistory(history);
    } catch (err) {
      setError("Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return {
    data,
    contacts,
    salesHistory,
    loading,
    error,
    refetch: fetchCustomer,
  };
};
