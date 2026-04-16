import { useState, useCallback } from 'react';
import { message } from 'antd';
import { purchasingService } from '../services/purchasingService';
import type { Supplier, CreateSupplierDto, SupplierFilters } from '../types/supplier.types';

interface UseSuppliersReturn {
  suppliers: Supplier[];
  loading: boolean;
  total: number;
  fetchSuppliers: (filters: SupplierFilters, page: number) => Promise<void>;
  getSupplier: (id: string) => Promise<Supplier | null>;
  createSupplier: (data: CreateSupplierDto) => Promise<Supplier>;
  updateSupplier: (id: string, data: Partial<CreateSupplierDto>) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
}

export const useSuppliers = (): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchSuppliers = useCallback(async (filters: SupplierFilters, _page: number) => {
    setLoading(true);
    try {
      const result = await purchasingService.getSuppliers(filters);
      setSuppliers(result.data);
      setTotal(result.total);
    } catch (error) {
      message.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, []);

  const getSupplier = useCallback(async (id: string): Promise<Supplier | null> => {
    try {
      return await purchasingService.getSupplier(id);
    } catch (error) {
      message.error('Failed to fetch supplier');
      return null;
    }
  }, []);

  const createSupplier = useCallback(async (data: CreateSupplierDto): Promise<Supplier> => {
    try {
      const supplier = await purchasingService.createSupplier(data);
      message.success('Supplier created successfully');
      return supplier;
    } catch (error) {
      message.error('Failed to create supplier');
      throw error;
    }
  }, []);

  const updateSupplier = useCallback(async (id: string, data: Partial<CreateSupplierDto>): Promise<Supplier> => {
    try {
      const supplier = await purchasingService.updateSupplier(id, data);
      setSuppliers(prev => prev.map(s => s.id === id ? supplier : s));
      message.success('Supplier updated successfully');
      return supplier;
    } catch (error) {
      message.error('Failed to update supplier');
      throw error;
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string): Promise<void> => {
    try {
      await purchasingService.deleteSupplier(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      message.success('Supplier deleted successfully');
    } catch (error) {
      message.error('Failed to delete supplier');
      throw error;
    }
  }, []);

  return {
    suppliers,
    loading,
    total,
    fetchSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};

export default useSuppliers;
