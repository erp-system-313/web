export interface ProductFilters {
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  categoryName: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  imageUrl?: string;
}
