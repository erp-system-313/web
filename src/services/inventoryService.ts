import { apiClient as api } from '../api/client';
import { endpoints } from '../api/endpoints';
import type { Product, CreateProductDto, ProductFilters } from '../types/product.types';
import type { Category, CreateCategoryDto } from '../types/category.types';

export const inventoryService = {
  async getProducts(filters: ProductFilters = {}, page = 1, size = 20): Promise<{ data: Product[]; total: number }> {
    const params: Record<string, string> = { page: String(page - 1), size: String(size), status: 'ACTIVE' };
    
    if (filters.categoryId !== undefined) params.categoryId = String(filters.categoryId);
    if (filters.search) params.search = filters.search;
    if (filters.minPrice !== undefined) params.minPrice = String(filters.minPrice);
    if (filters.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);
    if (filters.status) params.status = filters.status;
    
    const response = await api.get(endpoints.products.list, { params });
    return {
      data: response.data.data.content || [],
      total: response.data.data.totalElements || 0
    };
  },

  async getProduct(id: number): Promise<Product | null> {
    const response = await api.get(endpoints.products.getById(id));
    return response.data.data;
  },

  async getLowStockProducts(): Promise<Product[]> {
    const response = await api.get(endpoints.products.lowStock);
    return response.data.data || [];
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await api.post(endpoints.products.list, data);
    return response.data.data;
  },

  async updateProduct(id: number, data: Partial<CreateProductDto>): Promise<Product> {
    const response = await api.put(endpoints.products.update(id), data);
    return response.data.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await api.delete(endpoints.products.delete(id));
  },

  async getCategories(page = 1, size = 20): Promise<{ data: Category[]; total: number }> {
    const params: Record<string, string> = { page: String(page - 1), size: String(size), status: 'ACTIVE' };
    
    const response = await api.get(endpoints.categories.list, { params });
    return {
      data: response.data.data.content || [],
      total: response.data.data.totalElements || 0
    };
  },

  async getCategory(id: number): Promise<Category | null> {
    const response = await api.get(endpoints.categories.getById(id));
    return response.data.data;
  },

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post(endpoints.categories.list, data);
    return response.data.data;
  },

  async updateCategory(id: number, data: CreateCategoryDto): Promise<Category> {
    const response = await api.put(endpoints.categories.update(id), data);
    return response.data.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(endpoints.categories.delete(id));
  },
};

export default inventoryService;