import { useState, useCallback } from 'react';
import { message } from 'antd';
import { inventoryService } from '../services/inventoryService';
import type { Category, CreateCategoryDto } from '../types/category.types';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  getCategory: (id: string) => Promise<Category | null>;
  createCategory: (data: CreateCategoryDto) => Promise<Category>;
  updateCategory: (id: string, data: CreateCategoryDto) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getCategories();
      setCategories(data);
    } catch (error) {
      message.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategory = useCallback(async (id: string): Promise<Category | null> => {
    try {
      return await inventoryService.getCategory(id);
    } catch (error) {
      message.error('Failed to fetch category');
      return null;
    }
  }, []);

  const createCategory = useCallback(async (data: CreateCategoryDto): Promise<Category> => {
    try {
      const category = await inventoryService.createCategory(data);
      setCategories(prev => [...prev, category]);
      message.success('Category created successfully');
      return category;
    } catch (error) {
      message.error('Failed to create category');
      throw error;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: CreateCategoryDto): Promise<Category> => {
    try {
      const category = await inventoryService.updateCategory(id, data);
      setCategories(prev => prev.map(cat => cat.id === id ? category : cat));
      message.success('Category updated successfully');
      return category;
    } catch (error) {
      message.error('Failed to update category');
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      await inventoryService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      message.success('Category deleted successfully');
    } catch (error) {
      message.error('Failed to delete category');
      throw error;
    }
  }, []);

  return {
    categories,
    loading,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};

export default useCategories;
