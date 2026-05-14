export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductFilters {
  categoryId?: number;
  stockStatus?: StockStatus;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  categoryId: number;
  categoryName: string;
  supplierId?: number;
  supplierName?: string;
  unitPrice: number;
  costPrice: number;
  currentStock: number;
  reorderLevel: number;
  reorderQuantity?: number;
  unitOfMeasure?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  description: string;
  categoryId: number;
  unitPrice: number;
  costPrice: number;
  currentStock: number;
  reorderLevel: number;
  imageUrl?: string;
}
